namespace rental_services.Server.Models.DTOs
{
    public record BookingStatusDTO
    {
        public int Id { get; set; }
        public string Status { get; set; }
    }
}
