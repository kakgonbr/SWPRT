namespace rental_services.Server.Models.DTOs;

public record DriverLicenseDto(
    string LicenseId, 
    string HolderName, 
    DateOnly DateOfIssue
    

);