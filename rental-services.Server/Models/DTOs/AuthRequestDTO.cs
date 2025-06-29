namespace rental_services.Server.Models.DTOs;

public record UserDto(
    int UserId, 
    string Email, 
    string? PhoneNumber, 
    string? FullName, 
    string? Address, 
    DateOnly CreationDate, 
    bool EmailConfirmed, 
    DateOnly? DateOfBirth,
    bool IsActive,
    string Role,
    // TODO: Change DriverLicenseDto? to IEnumerable<DriverLicenseDto>? if multiple licenses are allowed
    IEnumerable<DriverLicenseDto>? DriverLicenses
);

public record LoginRequest(
    string Email, 
    string Password
);

public record SignupRequest(
    string Email, 
    string Password, 
    string PhoneNumber, 
    string Name
);

public record LoginResponse(
    string AccessToken, 
    string? RefreshToken, 
    DateTime ExpiresAt,
    UserDto User
);