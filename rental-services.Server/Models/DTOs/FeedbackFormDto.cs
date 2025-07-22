using Microsoft.AspNetCore.Http;

namespace rental_services.Server.Models.DTOs
{
    public class FeedbackFormDto
    {
        public string Title { get; set; } = null!;
        public string Body { get; set; } = null!;
        public IFormFile? Screenshot { get; set; }
    }
} 