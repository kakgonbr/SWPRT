namespace rental_services.Server.Models.DTOs;

/// <summary>
/// Represents a user data transfer object containing profile and account information.
/// </summary>
/// <param name="UserId">The unique identifier of the user.</param>
/// <param name="Email">The user's email address.</param>
/// <param name="PhoneNumber">The user's phone number.</param>
/// <param name="FullName">The user's full name (optional).</param>
/// <param name="Address">The user's address (optional).</param>
/// <param name="CreationDate">The date the user account was created.</param>
/// <param name="EmailConfirmed">Indicates whether the user's email has been confirmed.</param>
/// <param name="DateOfBirth">The user's date of birth (optional).</param>
/// <param name="IsActive">Indicates whether the user account is active.</param>
/// <param name="Role">The user's role (e.g., renter, admin).</param>
/// <param name="DriverLicenses">The user's driver license information (optional).</param>
public record UserDto(
    int UserId, 
    string Email, 
    string? PhoneNumber, 
    string? PasswordHash,
    string Role,
    string? FullName, 
    string? Address, 
    DateOnly CreationDate, 
    bool EmailConfirmed, 
    DateOnly? DateOfBirth,
    bool IsActive,
    string? Sub,
    IEnumerable<DriverLicenseDto>? DriverLicenses
);

/// <summary>
/// Represents a login request containing user credentials for authentication.
/// </summary>
/// <param name="Email">The user's email address.</param>
/// <param name="Password">The user's password.</param>
public record LoginRequest(
    string Email, 
    string Password
);

/// <summary>
/// Represents a signup request containing information required to register a new user.
/// </summary>
/// <param name="Email">The user's email address.</param>
/// <param name="Password">The user's chosen password.</param>
/// <param name="PhoneNumber">The user's phone number.</param>
/// <param name="Name">The user's full name.</param>
public record SignupRequest(
    string Email, 
    string Password, 
    string PhoneNumber, 
    string Name
);

/// <summary>
/// Represents a signup request containing information required to register a new user.
/// </summary>
/// <param name="Email">The user's email address.</param>
/// <param name="Password">The user's chosen password.</param>
/// <param name="PhoneNumber">The user's phone number.</param>
/// <param name="Name">The user's full name.</param>
public record LoginResponse(
    string AccessToken, 
    string? RefreshToken, 
    DateTime ExpiresAt,
    UserDto User
);

public record ForgotPasswordRequests(
    string Email,
    string newPassword
);