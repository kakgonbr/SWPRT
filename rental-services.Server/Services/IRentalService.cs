using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Services
{
    public interface IRentalService
    {
        Task CleanupPendingAsync();
        Task<List<BookingDTO>> GetAllBookingsAsync();
        Task<List<BookingDTO>> GetOfUserAsync(int userId);
        Task<string?> GetPaymentLinkAsync(int userId, string userIp);
        Task InformPaymentFailureAsync(int bookingId);
        Task<bool> InformPaymentSuccessAsync(int userId, long amount);
        Task<bool> UpdateStatusAsync(int id, string status);
        Task<bool> AddBookingAsync(Models.DTOs.BookingDTO bookingDTO);
        Task<RentalService.CreateRentalResult> CreateRentalAsync(int userId, int modelId, DateOnly start, DateOnly end, string? pickupLocation);
    }
}