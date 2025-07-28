namespace rental_services.Server.Models.DTOs;

public record DriverLicenseDto
{
    public DriverLicenseDto()
    {
    }

    public DriverLicenseDto(string licenseId, string? holderName, DateOnly? dateOfIssue)
    {
        LicenseId = licenseId;
        HolderName = holderName;
        DateOfIssue = dateOfIssue;
    }

    public DriverLicenseDto(string licenseId, string? holderName, DateOnly? dateOfIssue, string? licenseTypeStr) : this(licenseId, holderName, dateOfIssue)
    {
        LicenseTypeStr = licenseTypeStr;
    }

    public string LicenseId { get; set; } = null!;
    public string? HolderName { get; set; }
    public DateOnly? DateOfIssue { get; set; }
    public string? LicenseTypeStr { get; set; }
}