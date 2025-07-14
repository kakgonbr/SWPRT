namespace rental_services.Server.Models.DTOs
{
    public class ReportDTO
    {
        public int ReportId { get; set; }
        public int UserId { get; set; }
        public int TypeId { get; set; }
        public string Title { get; set; } = null!;
        public string Body { get; set; } = null!;
        public string ImagePath { get; set; } = null!;
        public DateTime ReportTime { get; set; } = DateTime.Now;
        public string? Status { get; set; }
        public string? TypeName { get; set; } 
        public string? UserName { get; set; } 
        public string? UserEmail { get; set; } 
    }
}
