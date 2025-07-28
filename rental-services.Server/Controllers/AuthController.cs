using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Data;
using rental_services.Server.Services;
using rental_services.Server.Utils;
using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace rental_services.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly JwtSettings _jwtSettings;
    private readonly IPasswordHasher<User> _hasher;
    private readonly RentalContext _db;
    private readonly IUserService _userService;
    private AutoMapper.IMapper _mapper;
    private static readonly ConcurrentDictionary<string, (string Otp, DateTime Expiry)> _otpStore = new();
    private readonly IGoogleOAuthService _googleService;

    public AuthController(IOptions<JwtSettings> jwtSettings, IPasswordHasher<User> hasher, RentalContext db,
        IUserService userService, AutoMapper.IMapper mapper, IGoogleOAuthService googleService)
    {
        _jwtSettings = jwtSettings.Value;
        _hasher = hasher;
        _db = db;
        _userService = userService;
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper), "Mapper cannot be null");
        _googleService = googleService;
    }

    /// <summary>
    /// Registers a new user in the system.
    /// </summary>
    /// <param name="request">The <see cref="SignupRequest"/> containing the user's email, password, phone number, and name.</param>
    /// <returns>Returns <see cref="IActionResult"/> with a success message if registration is successful, or a BadRequest with an error message if registration fails.</returns>
    /// <exception cref="ArgumentNullException">Thrown if the request is null.</exception>
    /// <exception cref="InvalidOperationException">Thrown if the email already exists or a database error occurs.</exception>
    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] SignupRequest request)
    {
        // Check if the email is already in use
        if (_db.Users.Any(u => u.Email == request.Email))
        {
            Console.WriteLine("AuthController: Email already exists in database.");
            return BadRequest(new { Message = "Cannot sign up: Email already exists." });
        }

        if (!Utils.Validator.PhoneNumber(request.PhoneNumber))
        {
            return BadRequest(new { Message = "Invalid phone number format" });
        }

        if (!Utils.Validator.Email(request.Email))
        {
            return BadRequest(new { Message = "Invalid email format" });
        }

        if (!Utils.Validator.Password(request.Password))
        {
            return BadRequest(new { Message = "Password must be between 8 to 32 characters, contain a lowercase character, an uppercase character, a number and a special character at least." });
        }

        string normalizedPhoneNumber = request.PhoneNumber.Replace(" ", "");

        if (normalizedPhoneNumber[0] == '0')
        {
            normalizedPhoneNumber = string.Concat("+84", normalizedPhoneNumber.AsSpan(1));
        }

        // Create new user
        var newUser = new User
        {
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            FullName = request.Name,
            CreationDate = DateOnly.FromDateTime(DateTime.UtcNow),
            EmailConfirmed = false,
            Sub = Guid.NewGuid().ToString(), // Generate a unique identifier for the user
        };
        newUser.PasswordHash = _hasher.HashPassword(newUser, request.Password);
        // Add the user to the database
        try
        {
            _db.Users.Add(newUser);
            await _db.SaveChangesAsync();
        }
        catch (Exception e)
        {
            Console.WriteLine("AuthController: Error while saving new user to database: " + e.Message);
            return BadRequest(new { Message = "Cannot sign up: " + e.Message });
        }

        return Ok(new
        {
            Message = "Successfully signed up! An email verification code has been sent to your email address."
        });
    }

    /// <summary>
    /// Authenticates a user using their email and password, and issues a JWT access token along with user details.
    /// </summary>
    /// <param name="request">
    /// The <see cref="LoginRequest"/> containing the user's email and password.
    /// </param>
    /// <returns>
    /// Returns <see cref="IActionResult"/> with a <see cref="LoginResponse"/> containing the access token, its expiration, and user information if authentication is successful.
    /// Returns <see cref="UnauthorizedResult"/> with an error message if credentials are invalid.
    /// </returns>
    /// <exception cref="ArgumentNullException">
    /// Thrown if the request is null.
    /// </exception>
    /// <exception cref="InvalidOperationException">
    /// Thrown if a database error occurs during user lookup.
    /// </exception>
    /// <remarks>
    /// Route: POST /api/auth/login
    /// </remarks>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Check if the user exists in the database
        var existingUser = await _userService.GetUser(request.Email);
        if (existingUser == null || existingUser.PasswordHash == null)
        {
            Console.WriteLine("AuthController: Email not found in database.");
            return Unauthorized(new { Message = "Cannot log in: Invalid credentials" });
        }

        // Check against hashed password
        var mappedUser = _mapper.Map<User>(existingUser);
        mappedUser.Sub = existingUser.Sub; // for editing, changed the dto to ignore sub, do this manually
        mappedUser.PasswordHash = existingUser.PasswordHash; // for editing, changed the dto to ignore password, do this manually
        var verifyHashedPassword =
            _hasher.VerifyHashedPassword(mappedUser, mappedUser.PasswordHash, request.Password);
        if (verifyHashedPassword == PasswordVerificationResult.Failed)
        {
            Console.WriteLine("AuthController: Password verification failed for user " + mappedUser.Email);
            return Unauthorized(new { Message = "Cannot log in: Invalid credentials" });
        }

        // Generate JWT token
        var accessToken = GenerateJwtToken(mappedUser, out var expires) ?? throw new ArgumentNullException("GenerateJwtToken(_mapper.Map<User>(mappedUser), out var expires)");
        var userDto = new UserDto(
            mappedUser.UserId,
            mappedUser.Email,
            mappedUser.PhoneNumber,
            null,
            mappedUser.Role,
            mappedUser.FullName,
            mappedUser.Address,
            mappedUser.CreationDate,
            mappedUser.EmailConfirmed,
            mappedUser.DateOfBirth,
            mappedUser.IsActive,
            mappedUser.Sub,
            mappedUser.DriverLicenses.Select(dl => new DriverLicenseDto(
                dl.LicenseId,
                dl.HolderName,
                dl.DateOfIssue,
                null
            //dl.ImageLicenseUrl
            ))
        );
        return Ok(new LoginResponse(accessToken, null, expires, userDto));
    }

    
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] Models.DTOs.ForgotPasswordRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { Message = "Email is required." });
        }

        if (!Utils.Validator.Email(request.Email))
        {
            return BadRequest(new { Message = "Invalid email format." });
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            return BadRequest(new { Message = "Email not found." });
        }

        // Generate OTP (6 digits)
        var otp = new Random().Next(100000, 999999).ToString();
        var expiry = DateTime.UtcNow.AddMinutes(10); // OTP expires in 10 minutes

        // Store OTP in memory (consider using a database or Redis in production)
        _otpStore[user.Email] = (otp, expiry);

        // Send OTP via email
        try
        {
            var subject = "Password Reset OTP";
            var content = $"Hello {user.FullName},\n\nYour OTP for password reset is: {otp}\n\nThis OTP is valid for 10 minutes.";
            EmailService.SendEmail(user.Email, subject, content);
        }
        catch (Exception e)
        {
            return StatusCode(500, new { Message = "Error sending OTP email: " + e.Message });
        }

        return Ok(new { Message = "An OTP has been sent to your email." });
    }


    [HttpPost("verify-otp")]
    public IActionResult VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Otp))
        {
            return BadRequest(new { Message = "Email and OTP are required." });
        }

        if (!_otpStore.TryGetValue(request.Email, out var otpData))
        {
            return BadRequest(new { Message = "No OTP found for this email." });
        }

        if (otpData.Expiry < DateTime.UtcNow)
        {
            _otpStore.TryRemove(request.Email, out _);
            return BadRequest(new { Message = "OTP has expired." });
        }

        if (otpData.Otp != request.Otp)
        {
            return BadRequest(new { Message = "Invalid OTP." });
        }

        return Ok(new { Message = "OTP verified successfully." });
    }


    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] Models.DTOs.ResetPasswordRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Otp) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { Message = "Email, OTP, and new password are required." });
        }

        if (!Utils.Validator.Password(request.NewPassword))
        {
            return BadRequest(new { Message = "Password must be between 8 to 32 characters, contain a lowercase character, an uppercase character, a number and a special character at least." });
        }

        if (!_otpStore.TryGetValue(request.Email, out var otpData))
        {
            return BadRequest(new { Message = "No OTP found for this email." });
        }

        if (otpData.Expiry < DateTime.UtcNow)
        {
            _otpStore.TryRemove(request.Email, out _);
            return BadRequest(new { Message = "OTP has expired." });
        }

        if (otpData.Otp != request.Otp)
        {
            return BadRequest(new { Message = "Invalid OTP." });
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            return BadRequest(new { Message = "Email not found." });
        }

        // Update password
        user.PasswordHash = _hasher.HashPassword(user, request.NewPassword);

        try
        {
            _db.Users.Update(user);
            await _db.SaveChangesAsync();
            _otpStore.TryRemove(request.Email, out _); // Clear OTP after successful reset
        }
        catch (Exception e)
        {
            return BadRequest(new { Message = "Error updating password: " + e.Message });
        }

        return Ok(new { Message = "Password has been reset successfully." });
    }

    [HttpGet("google/login")]
    public IActionResult GoogleLogin()
    {
        try
        {
            var googleAuthUrl = _googleService.GenerateGoogleOAuthUrl();
            Console.WriteLine($"AuthController: Redirecting to Google OAuth URL: {googleAuthUrl}");
            return Redirect(googleAuthUrl);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"AuthController: Error generating Google OAuth URL: {ex.Message}");
            var errorUrl = $"{Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5000"}/auth/login?error=google_config_error";
            return Redirect(errorUrl);
        }
    }
    
    [HttpGet("google/callback")]
    public async Task<IActionResult> GoogleCallback([FromQuery] string code, [FromQuery] string state, [FromQuery] string? error)
    {
        try
        {
            Console.WriteLine($"AuthController: Google callback received - Code: {!string.IsNullOrEmpty(code)}, State: {state}, Error: {error}");

            if (!string.IsNullOrEmpty(error))
            {
                Console.WriteLine($"AuthController: Google OAuth error: {error}");
                var errorUrl = $"{Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5000"}/auth/login?error=google_oauth_error";
                return Redirect(errorUrl);
            }

            if (string.IsNullOrEmpty(code))
            {
                Console.WriteLine("AuthController: No authorization code received");
                var errorUrl = $"{Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5000"}/auth/login?error=missing_code";
                return Redirect(errorUrl);
            }

            // Get user info from Google
            var googleUserInfo = await _googleService.GetUserInfoFromCodeAsync(code);
            Console.WriteLine($"AuthController: Google user info received - Email: {googleUserInfo.Email}, Name: {googleUserInfo.Name}");

            // Check if user exists or create new user
            var existingUserDto = await _userService.GetUser(googleUserInfo.Email);
            var user = existingUserDto != null ? _mapper.Map<User>(existingUserDto) : null;

            if (user != null)
            {
                // Manually map the fields that might be ignored by AutoMapper
                user.Sub = existingUserDto.Sub;
                user.PasswordHash = existingUserDto.PasswordHash;
                Console.WriteLine($"AuthController: Existing user found - ID: {user.UserId}");
            }
            else
            {
                Console.WriteLine("AuthController: Creating new user");
                user = new User
                {
                    Email = googleUserInfo.Email,
                    FullName = googleUserInfo.Name,
                    GoogleuserId = googleUserInfo.GoogleId,
                    Role = "Customer",
                    CreationDate = DateOnly.FromDateTime(DateTime.UtcNow),
                    EmailConfirmed = googleUserInfo.EmailVerified,
                    Sub = Guid.NewGuid().ToString(),
                    PhoneNumber = string.Empty,
                    IsActive = true
                };

                try
                {
                    _userService.CreateUser(user);
                    Console.WriteLine($"AuthController: New user created - ID: {user.UserId}");
                }
                catch (Exception e)
                {
                    Console.WriteLine("AuthController: Error creating Google user: " + e.Message);
                    var errorUrl = $"{Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5000"}/auth/login?error=user_creation_failed";
                    return Redirect(errorUrl);
                }
            }

            // Generate JWT token
            Console.WriteLine("AuthController: Generating JWT token");
            var accessToken = GenerateJwtToken(user, out var expires);
            Console.WriteLine($"AuthController: JWT token generated, length: {accessToken.Length}");

            var redirectUrl = $"{Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5000"}/auth/login/google/callback?token={accessToken}";
            Console.WriteLine($"AuthController: Redirecting to: {redirectUrl}");
            return Redirect(redirectUrl);
        }
        catch (Exception ex)
        {
            Console.WriteLine("AuthController: Exception in GoogleCallback: " + ex.Message);
            Console.WriteLine("AuthController: Stack trace: " + ex.StackTrace);
            var errorUrl = $"{Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5000"}/auth/login?error=server_error";
            return Redirect(errorUrl);
        }
    }

    /// <summary>
    /// Handles user logout by instructing the client to remove the refresh token.
    /// For stateless JWT authentication, no server-side action is required, but this endpoint can be used to acknowledge logout or revoke refresh tokens if implemented.
    /// </summary>
    /// <param name="refreshToken">The refresh token to be revoked (if applicable).</param>
    /// <returns>
    /// Returns <see cref="OkObjectResult"/> with a message indicating the refresh token has been revoked successfully.
    /// </returns>
    [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] string refreshToken)
        {
            return Ok(new { Message = "Refresh token revoked successfully." });
        }

        /// <summary>
        /// A
        /// </summary>
       
        /// <summary>
        /// Retrieves the authenticated user's information based on the access token provided in the request.
        /// This endpoint is useful for refreshing user data on the client side without requiring the user to re-authenticate.
        /// Typical use cases include updating user profile information or refreshing session data after login.
        /// </summary>
        /// <remarks>
        /// Requires a valid JWT access token in the Authorization header.
        /// </remarks>
        /// <returns>
        /// Returns <see cref="OkObjectResult"/> with a <see cref="UserDto"/> containing the user's details if the user is found.
        /// Returns <see cref="NotFoundObjectResult"/> with an error message if the user does not exist.
        /// </returns>
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userSub = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
            var user = await _userService.GetUserBySubAsync(userSub.Value);
            if (user == null) return NotFound(new { Message = "User not found" });
        return Ok(new UserDto(
            user.UserId,
            user.Email,
            user.PhoneNumber,
            null,
            user.Role,
            user.FullName,
            user.Address,
            user.CreationDate,
            user.EmailConfirmed,
            user.DateOfBirth,
            user.IsActive,
            user.Sub,
            user.DriverLicenses?.Select(dl => new DriverLicenseDto(
                dl.LicenseId,
                dl.HolderName,
                dl.DateOfIssue,
                null
            ))));
        }

    /// <summary>
    /// Generates a JWT access token for the specified user, embedding user claims such as subject, email, and role.
    /// The token is signed using the configured secret key and includes issuer, audience, and expiration information.
    /// </summary>
    /// <param name="user">The <see cref="User"/> entity for whom the JWT token is generated.</param>
    /// <param name="expiration">
    /// When the method returns, contains the <see cref="DateTime"/> value representing the token's expiration time.
    /// </param>
    /// <returns>
    /// A <see cref="string"/> containing the serialized JWT access token.
    /// </returns>
    private string GenerateJwtToken(User user, out DateTime expiration)
    {
        // Add null checks and default values
        var sub = user.Sub ?? throw new ArgumentNullException(nameof(user.Sub), "User Sub cannot be null");
        var email = user.Email ?? throw new ArgumentNullException(nameof(user.Email), "User Email cannot be null");
        var role = user.Role ?? "Customer"; // Default role if null
        var userId = user.UserId.ToString();

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, sub),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim("VroomVroomUserId", userId),
        };

        string jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") ?? _jwtSettings.Key;
        string jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? _jwtSettings.Issuer;
        string jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? _jwtSettings.Audience;
        int jwtDuration = int.TryParse(Environment.GetEnvironmentVariable("JWT_DURATION"), out var duration)
            ? duration
            : _jwtSettings.DurationInMinutes;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        expiration = DateTime.UtcNow.AddMinutes(jwtDuration);

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: expiration,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRandomPassword(int length = 12)
    {
        const string validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()";
        var random = new Random();
        var password = new char[length];

        for (int i = 0; i < length; i++)
        {
            password[i] = validChars[random.Next(validChars.Length)];
        }

        return new string(password);
    }

}