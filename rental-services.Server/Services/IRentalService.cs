using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Services
{
    public interface IRentalService
    {
        Task<List<BookingDTO>> GetAllBookingsAsync();
        Task<List<BookingDTO>> GetOfUserAsync(int userId);
        Task<bool> UpdateStatusAsync(int id, string status);
        Task<bool> AddBookingAsync(Models.DTOs.BookingDTO bookingDTO);
    }
}