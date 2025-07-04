namespace rental_services.Server.Models.DTOs
{
    public class GplxData
    {
        public string? FullName { get; set; }
        public string? DateOfBirth { get; set; }
        public string? LicenseNumber { get; set; }
        public string? LicenseClass { get; set; } // Hạng bằng lái
        public string? Address { get; set; }
        public string? DateOfIssue { get; set; }
    }
} 