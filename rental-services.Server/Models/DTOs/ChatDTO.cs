namespace rental_services.Server.Models.DTOs
{
    public class ChatDTO
    {
        public int ChatId { get; set; }
        public int UserId { get; set; }
        public int? StaffId { get; set; }
        public string Status { get; set; } = null!;
        public string Priority { get; set; } = null!;
        public DateTime OpenTime { get; set; }
        public string Subject { get; set; } = null!;
        public string UserName { get; set; } = null!;   
        public string StaffName { get; set; } = string.Empty;
    }
}
