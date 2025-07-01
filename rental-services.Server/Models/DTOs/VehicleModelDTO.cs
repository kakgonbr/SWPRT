namespace rental_services.Server.Models.DTOs
{
    // for viewing on the list
    public record VehicleModelDTO
    {
        public int ModelId { get; set; }

        public string DisplayName { get; set; } = null!;

        public string Description { get; set; } = null!;

        public long RatePerDay { get; set; }

        public string? ImageFile { get; set; }

        public int UpFrontPercentage { get; set; }
 
        public bool IsAvailable { get; set; }
        
        public decimal Rating { get; set; }

        public string VehicleType { get; set; } = null!;

        public IEnumerable<string> Shops { get; set; } = null!;
    }
}
