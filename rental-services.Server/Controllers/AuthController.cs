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

namespace rental_services.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly JwtSettings _jwtSettings;
    private readonly IPasswordHasher<User> _hasher;
    private readonly RentalContext _db;
    private readonly IUserService _userService;

    public AuthController(IOptions<JwtSettings> jwtSettings, IPasswordHasher<User> hasher, RentalContext db, IUserService userService)
    {
        _jwtSettings = jwtSettings.Value;
        _hasher = hasher;
        _db = db;
        _userService = userService;
    }

    /// <summary>
    /// Signs up a new user with Auth0
    /// </summary>
    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] SignupRequest request)
    {
        // Check if the email is already in use
        if (_db.Users.Any(u => u.Email == request.Email))
        {
            Console.WriteLine("AuthController: Email already exists in database.");
            return BadRequest(new {Message = "Cannot sign up: Email already exists."});
        }
        // Create new user
        var newUser = new User
        {
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            FullName = request.Name,
            CreationDate = DateOnly.FromDateTime(DateTime.UtcNow),
            EmailConfirmed = false
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
            return BadRequest(new {Message = "Cannot sign up: " + e.Message});
        }
        return Ok(new
        {
            Message = "Successfully signed up! An email verification code has been sent to your email address."
        });
    }
    
    /// <summary>
    /// Logs a new user in with Auth0 and grants an access token and user DTO
    /// /api/auth/login
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Check if the user exists in the database
        var existingUser = _db.Users.SingleOrDefault(u => u.Email == request.Email);
        if (existingUser == null || existingUser.PasswordHash == null)
        {
            Console.WriteLine("AuthController: Email not found in database.");
            return Unauthorized(new {Message = "Cannot log in: Invalid credentials"});
        }
        // Check against hashed password
        var verifyHashedPassword = _hasher.VerifyHashedPassword(existingUser, existingUser.PasswordHash, request.Password);
        if (verifyHashedPassword == PasswordVerificationResult.Failed)
        {
            Console.WriteLine("AuthController: Password verification failed for user " + existingUser.Email);
            return Unauthorized(new {Message = "Cannot log in: Invalid credentials"});
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
            )).SingleOrDefault()
        );
        return Ok(new LoginResponse(accessToken, null, expires, userDto));
    }
    
    /// <summary>
    /// Simply instructs client to drop the token; 
    /// for stateless JWTs no server-side action is required
    /// </summary>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] string refreshToken)
    {
        return Ok(new {Message = "Refresh token revoked successfully."});
    }

    /// <summary>
    /// Refetches user information based on access token.
    /// This is useful for refreshing user data without re-authenticating.
    /// Use cases include refreshing pages or updating user profile information.
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = int.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!);
        var user = await _userService.GetUser(userId);
        if (user == null) return NotFound(new {Message = "User not found"});
        var dto = new UserDto(
            user.UserId,
            user.Email,
            user.PhoneNumber,
            user.FullName,
            user.Address,
            user.CreationDate,
            user.EmailConfirmed,
            user.DateOfBirth,
            user.IsActive,
            user.Role,
            user.DriverLicenses.Select(dl => new DriverLicenseDto(
                dl.LicenseId, 
                dl.HolderName,
                dl.DateOfIssue
            )).SingleOrDefault()
        );
        return Ok(dto);
    }
    
    /// <summary>
    /// Helper method to generate JWT token
    /// </summary>
    private string GenerateJwtToken(User user, out DateTime expiration)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,   user.UserId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role,               user.Role)
        };
        
        string jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") ?? _jwtSettings.Key;
        string jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? _jwtSettings.Issuer;
        string jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? _jwtSettings.Audience;
        int jwtDuration = int.TryParse(Environment.GetEnvironmentVariable("JWT_DURATION"), out var duration) ? duration : _jwtSettings.DurationInMinutes;

        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        expiration = DateTime.UtcNow.AddMinutes(jwtDuration);

        var token = new JwtSecurityToken(
            issuer:            jwtIssuer,
            audience:          jwtAudience,
            claims:            claims,
            expires:           expiration,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}