namespace rental_services.Server.Models.DTOs
{
    public record VehicleDTO
    {
        public int VehicleId { get; set; }

        public int? ModelId { get; set; }

        public string? Condition { get; set; } = null!;

        public ShopDTO Shop { get; set; } = null!;
    }
}
