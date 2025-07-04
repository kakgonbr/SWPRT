namespace rental_services.Server.Models.DTOs
{
    public record VehicleTypeDTO
    {
        public int VehicleTypeId { get; set; }

        public string VehicleTypeName { get; set; } = null!;

        public int CylinderVolumeCm3 { get; set; }
    }
}
