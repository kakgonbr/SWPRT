namespace rental_services.Server.Models.DTOs;

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);

public record ChangePasswordResponse(
    bool Success,
    string? ErrorMessage = null
);