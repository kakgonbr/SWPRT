using rental_services.Server.Models;

namespace rental_services.Server.Repositories
{
    public interface IManufacturerRepository
    {
        Task<int> AddAsync(Manufacturer manufacturer);
        Task<int> DeleteAsync(int id);
        Task<List<Manufacturer>> GetAllAsync();
        Task<Manufacturer?> GetByIdAsync(int id);
        Task<int> SaveAsync();
        Task<int> UpdateAsync(Manufacturer manufacturer);
    }
}