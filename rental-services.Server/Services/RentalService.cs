using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Services
{
    public class RentalService : IRentalService
    {
        private Repositories.IBookingRepository _bookingRepository;
        private Repositories.IPeripheralRepository _peripheralRepository;
        private AutoMapper.IMapper _mapper;

        public RentalService(Repositories.IBookingRepository bookingRepository, AutoMapper.IMapper mapper, Repositories.IPeripheralRepository peripheralRepository)
        {
            _bookingRepository = bookingRepository;
            _mapper = mapper;
            _peripheralRepository = peripheralRepository;
        }

        public async Task<bool> AddBookingAsync (Models.DTOs.BookingDTO booking)
        {
            if (booking.StartDate >= booking.EndDate)
            {
                return false;
            }
            Models.Booking newBooking = _mapper.Map<Models.Booking>(booking);
            var userBookings = await _bookingRepository.GetOfUserAsync(booking.CustomerId);
            bool hasOverlap = userBookings.Any(existingBookings =>
                booking.StartDate < existingBookings.EndDate &&
                booking.EndDate > existingBookings.StartDate
            );
            if (hasOverlap) { return false; }
            int rowEffected = await _bookingRepository.AddAsync(newBooking);
            return rowEffected > 0;
        }

        public async Task<List<Models.DTOs.BookingDTO>> GetAllBookingsAsync()
        {
            return _mapper.Map<List<Models.DTOs.BookingDTO>>(await _bookingRepository.GetAllAsync());
        }

        public async Task<List<Models.DTOs.BookingDTO>> GetOfUserAsync(int userId)
        {
            return _mapper.Map<List<Models.DTOs.BookingDTO>>(await _bookingRepository.GetOfUserAsync(userId));
        }

        public async Task<bool> UpdateStatusAsync(int id, string status)
        {
            if (Utils.Config.BookingStatus.IsValid(status))
            {
                return false;
            }
            return await _bookingRepository.UpdateStatusAsync(id, status) != 0;
        }
    }
}
