namespace rental_services.Server.Models.DTOs
{
    public class ChatMessageDTO
    {
        public int ChatMessageId { get; set; }
        public int ChatId { get; set; }
        public int SenderId { get; set; }
        public string Content { get; set; } = null!;
        public DateTime SendTime { get; set; }
    }
}
