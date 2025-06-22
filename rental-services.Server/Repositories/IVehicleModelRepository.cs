using rental_services.Server.Models;

namespace rental_services.Server.Repositories
{
    public interface IVehicleModelRepository
    {
        Task AddAsync(VehicleModel product);
        Task DeleteAsync(int id);
        Task<List<VehicleModel>> GetAllAsync();
        Task<VehicleModel?> GetByIdAsync(int id);
        Task<List<Vehicle>> GetOfModelAsync(int modelId);
        Task<List<Vehicle>> GetOfModelAsync(VehicleModel model);
        Task SaveAsync();
        Task UpdateAsync(VehicleModel product);
    }
}