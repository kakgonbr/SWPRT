using System.ComponentModel.DataAnnotations;

namespace rental_services.Server.Models.DTOs
{
    public record SystemSettingsDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string SiteName { get; set; } = null!;
        [Required]
        [StringLength(1024)]
        public string SiteDescription { get; set; } = null!;
        [Required]
        [EmailAddress]
        public string ContactEmail { get; set; } = null!;
        [Required]
        [Phone]
        public string SupportPhone { get; set; } = null!;
        [Required]
        [Range(1, 365)]
        public int MaxRentalDays { get; set; }
        [Required]
        [Range(3, 24)]
        public int MinRentalHours { get; set; }
        [Required]
        [Range(1, 240)]
        public int CancellationDeadlineHours { get; set; }
        [Required]
        [Range(3, 10)]
        public int MaxConcurrentRentals { get; set; }
        [Required]
        public bool EmailNotifications { get; set; }
        [Required]
        public bool SmsNotifications { get; set; }
        [Required]
        public bool AutoApprovalEnabled { get; set; }
        [Required]
        public bool RequireIdVerification { get; set; }
        public string? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
    }
}
