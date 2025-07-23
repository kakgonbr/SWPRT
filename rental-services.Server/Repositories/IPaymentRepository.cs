using rental_services.Server.Models;

namespace rental_services.Server.Repositories
{
    public interface IPaymentRepository
    {
        Task<int> AddAsync(Payment peripheral);
        Task<int> DeleteAsync(int id);
        Task<int> DeleteWithBookingAsync(int bookingId);
        Task<List<Payment>> GetAllAsync();
        Task<Payment?> GetByBookingIdAsync(int bookingId);
        Task<Payment?> GetByIdAsync(int id);
        Task<int> SaveAsync();
        Task<int> UpdateAsync(Payment peripheral);
    }
}