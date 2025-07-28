namespace rental_services.Server.Models.DTOs
{
    public record BookingDTO
    {
        public string Id { get; set; } = null!;
        public int CustomerId { get; set; }
        public int VehicleModelId { get; set; }
        public string BikeName { get; set; } = null!;
        public int? BikeId { get; set; }
        public string BikeImageUrl { get; set; } = null!;
        public string CustomerName { get; set; } = null!;
        public string CustomerEmail { get; set; } = null!;
        public string? CustomerPhone { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public DateOnly? OrderDate { get; set; }
        public string Status { get; set; } = null!;
        public decimal PricePerDay { get; set; }
        public IEnumerable<PeripheralDTO>? Peripherals { get; set; } = null;
        public string? PickupLocation { get; set; }
        public string? ReturnLocation { get; set; }
        public string? PaymentMethod { get; set; }
        public string? Notes { get; set; }
        public decimal? Deposit { get; set; }
        public decimal? Tax { get; set; }
        public decimal? Discount { get; set; }
    }
}