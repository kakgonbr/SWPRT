using rental_services.Server.Models;

namespace rental_services.Server.Repositories
{
    public interface IBookingRepository
    {
        Task<int> AddAsync(Booking booking);
        Task<int> DeleteAsync(int id);
        Task<List<Booking>> GetAllAsync();
        Task<Booking?> GetByIdAsync(int id);
        Task<List<Booking>> GetOfUserAsync(int userId);
        Task<int> SaveAsync();
        Task<int> UpdateAsync(Booking booking);
        Task<int> UpdateStatusAsync(int id, string status);
    }
}