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
        public string TypeName { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
    }
}
