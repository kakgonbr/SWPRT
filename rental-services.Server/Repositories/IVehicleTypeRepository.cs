using rental_services.Server.Models;

namespace rental_services.Server.Repositories
{
    public interface IVehicleTypeRepository
    {
        Task<int> AddAsync(VehicleType vehicleType);
        Task<int> DeleteAsync(int id);
        Task<List<VehicleType>> GetAllAsync();
        Task<VehicleType?> GetByIdAsync(int id);
        Task<int> SaveAsync();
        Task<int> UpdateAsync(VehicleType vehicleType);
    }
}