namespace rental_services.Server.Models.DTOs
{
    // for viewing details
    public record VehicleDetailsDTO
    {
        // always present
        public int ModelId { get; set; }
        // for updating
        public int? VehicleTypeId { get; set; }

        public int? ShopId { get; set; }

        // for both
        public string ModelName { get; set; } = null!;

        public long RatePerDay { get; set; }

        public int ManufacturerId { get; set; }

        public string? ImageFile { get; set; }

        public string Description { get; set; } = null!;

        public int UpFrontPercentage { get; set; }

        public bool IsAvailable { get; set; }

        public IEnumerable<PeripheralDTO> Peripherals { get; set; } = null!;

        // for viewing
        public string? DisplayName { get; set; } = null!;

        public decimal? Rating { get; set; }

        public string? VehicleType { get; set; } = null!;

        public string? Shop { get; set; } = null!;

        public int? NumOfAvailable { get; set; }
    }
}
