using rental_services.Server.Models;

namespace rental_services.Server.Repositories
{
    public interface IVehicleRepository
    {
        Task<List<Models.Vehicle>> GetAllAsync();
        Task<Models.Vehicle?> GetByIdAsync(int id);
        Task<Models.Vehicle> AddAsync(Models.Vehicle vehicle);
        Task<int> UpdateAsync(Models.Vehicle vehicle);
        Task<int> DeleteAsync(int id);
        Task<int> SaveAsync();
        void DeleteRange(List<Vehicle> toDelete);
    }
}
