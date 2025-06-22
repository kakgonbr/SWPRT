using rental_services.Server.Models;

namespace rental_services.Server.Repositories
{
    public interface IVehicleModelRepository
    {
        Task<int> AddAsync(VehicleModel product);
        Task<int> DeleteAsync(int id);
        Task<List<VehicleModel>> GetAllAsync();
        Task<VehicleModel?> GetByIdAsync(int id);
        Task<List<Vehicle>> GetOfModelAsync(int modelId);
        Task<List<Vehicle>> GetOfModelAsync(VehicleModel model);
        Task<int> SaveAsync();
        Task<int> UpdateAsync(VehicleModel product);
    }
}