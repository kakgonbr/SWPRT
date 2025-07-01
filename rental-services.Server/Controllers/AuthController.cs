using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
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

    public AuthController(IOptions<JwtSettings> jwtSettings, IPasswordHasher<User> hasher, RentalContext db,
        IUserService userService)
    {
        _jwtSettings = jwtSettings.Value;
        _hasher = hasher;
        _db = db;
        _userService = userService;
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
        var existingUser = _db.Users
            .Include(u => u.DriverLicenses)
            .SingleOrDefault(u => u.Email == request.Email);
        if (existingUser == null || existingUser.PasswordHash == null)
        {
            Console.WriteLine("AuthController: Email not found in database.");
            return Unauthorized(new { Message = "Cannot log in: Invalid credentials" });
        }

        // Check against hashed password
        var verifyHashedPassword =
            _hasher.VerifyHashedPassword(existingUser, existingUser.PasswordHash, request.Password);
        if (verifyHashedPassword == PasswordVerificationResult.Failed)
        {
            Console.WriteLine("AuthController: Password verification failed for user " + existingUser.Email);
            return Unauthorized(new { Message = "Cannot log in: Invalid credentials" });
        }

        // Generate JWT token
        var accessToken = GenerateJwtToken(existingUser, out var expires);
        var userDto = new UserDto(
            existingUser.UserId,
            existingUser.Email,
            existingUser.PhoneNumber,
            existingUser.FullName,
            existingUser.Address,
            existingUser.CreationDate,
            existingUser.EmailConfirmed,
            existingUser.DateOfBirth,
            existingUser.IsActive,
            existingUser.Role,
            existingUser.DriverLicenses.Select(dl => new DriverLicenseDto(
                dl.LicenseId,
                dl.HolderName,
                dl.DateOfIssue
                //dl.ImageLicenseUrl
            ))
        );
        return Ok(new LoginResponse(accessToken, null, expires, userDto));
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
        var userId = int.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!);
        var user = await _userService.GetUser(userId);
        if (user == null) return NotFound(new { Message = "User not found" });
        //var dto = new UserDto(
        //    user.UserId,
        //    user.Email,
        //    user.PhoneNumber,
        //    user.FullName,
        //    user.Address,
        //    user.CreationDate,
        //    user.EmailConfirmed,
        //    user.DateOfBirth,
        //    user.IsActive,
        //    user.Role,
        //    user.DriverLicenses.Select(dl => new DriverLicenseDto(
        //        dl.LicenseId, 
        //        dl.HolderName,
        //        dl.DateOfIssue,
        //        dl.ImageLicenseUrl
        //    )).SingleOrDefault()
        //);
        return Ok(user);
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
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Sub),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("VroomVroomUserId", user.UserId.ToString())
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