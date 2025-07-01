namespace rental_services.Server.Models.DTOs
{
    public record MaintenanceDTO
    {
        public DateTime? Start { get; set; }
        public DateTime? End { get; set; }
        public string Message { get; set; } = null!;
    }
}
