using rental_services.Server.Models;

namespace rental_services.Server.Repositories
{
    public interface IBannerRepository
    {
        Task<int> AddAsync(Banner booking);
        Task<int> DeleteAsync(int id);
        Task<List<Banner>> GetAllAsync();
        Task<Banner?> GetByIdAsync(int id);
        Task<Banner?> GetTopBanner();
        Task<int> SaveAsync();
        Task<int> UpdateAsync(Banner booking);
    }
}