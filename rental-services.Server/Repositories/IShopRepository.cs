using rental_services.Server.Models;

namespace rental_services.Server.Repositories
{
    public interface IShopRepository
    {
        Task<int> AddAsync(Shop shop);
        Task<int> DeleteAsync(int id);
        Task<List<Shop>> GetAllAsync();
        Task<Shop?> GetByIdAsync(int id);
        Task<int> SaveAsync();
        Task<int> UpdateAsync(Shop shop);
    }
}