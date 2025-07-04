namespace rental_services.Server.Models.DTOs
{
    public record ManufacturerDTO
    {
        public int ManufacturerId { get; set; }

        public string ManufacturerName { get; set; } = null!;
    }
}
