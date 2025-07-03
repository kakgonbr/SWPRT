using System.ComponentModel.DataAnnotations;

namespace rental_services.Server.Models.DTOs
{
    public class ServerInfoDTO
    {
        public string SiteName { get; set; } = null!;
        public string SiteDescription { get; set; } = null!;
        public string ContactEmail { get; set; } = null!;
        public string SupportPhone { get; set; } = null!;
    }
}
