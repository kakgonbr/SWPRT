using rental_services.Server.Models.DTOs;
using rental_services.Server.Models;

namespace rental_services.Server.Services
{
    public interface IBikeService
    {
        Task<bool> AddPhysicalAsync(int modelId, VehicleDTO vehicle);
        Task<bool> AddVehicleModel(VehicleDetailsDTO vehicleModel);
        Task<bool> DeletePhysicalAsync(int id);
        Task<bool> DeleteVehicleModel(int modelId);
        Task<List<VehicleModelDTO>> GetAvailableModelsAsync(DateOnly startDate, DateOnly endDate, string? address);
        Task<List<VehicleDTO>> GetDTOOfModelAsync(int modelId);
        Task<List<VehicleDTO>> GetDTOOfModelAsync(VehicleModel model);
        Task<List<VehicleModelDTO>> GetModelListAsync();
        Task<List<Vehicle>> GetOfModelAsync(int modelId);
        Task<List<Vehicle>> GetOfModelAsync(VehicleModel model);
        Task<VehicleDetailsDTO?> GetVehicleDetails(int modelId);
        Task<List<VehicleModel>> GetVehicleModelsAsync();
        Task<List<Vehicle>> GetVehiclesAsync();
        Task<bool> UpdatePhysicalAsync(VehicleDTO vehicle);
        Task<bool> UpdateVehicleModelAsync(VehicleDetailsDTO vehicleModel);
    }
}
