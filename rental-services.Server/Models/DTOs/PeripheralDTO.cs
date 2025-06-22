namespace rental_services.Server.Models.DTOs
{
    public record PeripheralDTO
    {
        public int PeripheralId { get; set; }

        public string Name { get; set; } = null!;

        public long RatePerDay { get; set; }
    }
}
