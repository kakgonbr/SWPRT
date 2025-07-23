namespace rental_services.Server.Models.DTOs
{
    public class FeedbackDTO
    {
        public int? FeedBackId { get; set; }
        public int? UserId { get; set; }
        public string Title { get; set; } = null!;
        public string Body { get; set; } = null!;
        public string? ImagePath { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
    }
} 