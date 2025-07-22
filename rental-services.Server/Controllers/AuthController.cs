using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
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
using Microsoft.EntityFrameworkCore;

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

    public AuthController(IOptions<JwtSettings> jwtSettings, IPasswordHasher<User> hasher, RentalContext db,
        IUserService userService, AutoMapper.IMapper mapper)
    {
        _jwtSettings = jwtSettings.Value;
        _hasher = hasher;
        _db = db;
        _userService = userService;
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper), "Mapper cannot be null");
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
                dl.DateOfIssue
                //dl.ImageLicenseUrl
            ))
        );
        return Ok(new LoginResponse(accessToken, null, expires, userDto));
    }
    
    
    [HttpPost("login/google")]
    public IActionResult GoogleLogin()
    {
        // Redirect to Google OAuth login
        var props = new AuthenticationProperties { RedirectUri = "/api/auth/login/google/callback" };
        return Challenge(props, GoogleDefaults.AuthenticationScheme);
    }
    
    [HttpGet("login/google/callback")]
    public async Task<IActionResult> GoogleCallback()
    {
        // Authenticate the user with Google
        var result = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
        if (!result.Succeeded)
        {
            Console.WriteLine("AuthController: Google authentication failed.");
            return BadRequest(new { Message = "Google authentication failed." });
        }

        // Extract user info from Google
        var claims = result.Principal.Claims;
        var email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
        var name = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
        var googleId = claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(googleId))
        {
            Console.WriteLine("AuthController: Unable to retrieve user information from Google.");
            return BadRequest(new { Message = "Unable to retrieve user information from Google." });
        }
        
        var user = _mapper.Map<User>(_userService.GetUser(email));
        if (user == null)
        {
            user = new User
            {
                Email = email,
                FullName = name,
                GoogleuserId = googleId,
                Role = "User", // Default role
                CreationDate = DateOnly.FromDateTime(DateTime.UtcNow),
                EmailConfirmed = true, // Google verifies email
                Sub = Guid.NewGuid().ToString(),
                PhoneNumber = "", // Optional: Prompt user to add later
                IsActive = true
            };
            try
            {
                _userService.CreateUser(user);
                await _db.SaveChangesAsync();
            }
            catch (Exception e)
            {
                Console.WriteLine("AuthController: Error creating Google user: " + e.Message);
                return BadRequest(new { Message = "Failed to create user: " + e.Message });
            }
        }
        // Generate JWT token
        var accessToken = GenerateJwtToken(user, out var expires);
        var userDto = new UserDto(
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
                dl.DateOfIssue
            ))
        );
        
        var redirectUrl = $"{Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000"}/auth/login/google/callback?token={accessToken}";
        return Redirect(redirectUrl);
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
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        // This endpoint is not implemented yet
        return Ok(new { Message = "Forgot password functionality is not implemented yet." });
    }

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
                dl.DateOfIssue
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
}