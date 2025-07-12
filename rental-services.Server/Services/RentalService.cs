using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Services
{
    public class RentalService : IRentalService
    {
        private Repositories.IBookingRepository _bookingRepository;
        private Repositories.IPeripheralRepository _peripheralRepository;
        private AutoMapper.IMapper _mapper;
        private readonly ILogger<RentalService> _logger;

        public RentalService(Repositories.IBookingRepository bookingRepository, AutoMapper.IMapper mapper, Repositories.IPeripheralRepository peripheralRepository, ILogger<RentalService> logger)
        {
            _bookingRepository = bookingRepository;
            _mapper = mapper;
            _peripheralRepository = peripheralRepository;
            _logger = logger;
        }

        public async Task<bool> AddBookingAsync(Models.DTOs.BookingDTO booking)
        {
            try
            {
                // Log the incoming booking data
                _logger.LogInformation("AddBookingAsync called with booking data: {@Booking}", booking);
                _logger.LogInformation("Booking details - CustomerId: {CustomerId}, BikeId: {BikeId}, VehicleModelId: {VehicleModelId}, StartDate: {StartDate}, EndDate: {EndDate}",
                    booking.CustomerId, booking.BikeId, booking.VehicleModelId, booking.StartDate, booking.EndDate);

                // Check date validation
                if (booking.StartDate >= booking.EndDate)
                {
                    _logger.LogWarning("Date validation failed - StartDate: {StartDate} >= EndDate: {EndDate}", booking.StartDate, booking.EndDate);
                    return false;
                }
                _logger.LogInformation("Date validation passed");

                // Check BikeId validation
                if (!booking.BikeId.HasValue || booking.BikeId.Value <= 0)
                {
                    _logger.LogWarning("BikeId validation failed - BikeId: {BikeId}", booking.BikeId);
                    return false;
                }
                _logger.LogInformation("BikeId validation passed - BikeId: {BikeId}", booking.BikeId);

                // Check CustomerId validation
                if (booking.CustomerId <= 0)
                {
                    _logger.LogWarning("CustomerId validation failed - CustomerId: {CustomerId}", booking.CustomerId);
                    return false;
                }
                _logger.LogInformation("CustomerId validation passed - CustomerId: {CustomerId}", booking.CustomerId);

                // Try mapping
                _logger.LogInformation("Attempting to map BookingDTO to Booking model");
                Models.Booking newBooking;
                try
                {
                    newBooking = _mapper.Map<Models.Booking>(booking);
                    _logger.LogInformation("Mapping successful - Mapped booking: {@MappedBooking}", newBooking);
                    _logger.LogInformation("Mapped booking details - BookingId: {BookingId}, UserId: {UserId}, VehicleId: {VehicleId}, StartDate: {StartDate}, EndDate: {EndDate}, Status: {Status}",
                        newBooking.BookingId, newBooking.UserId, newBooking.VehicleId, newBooking.StartDate, newBooking.EndDate, newBooking.Status);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "AutoMapper mapping failed");
                    return false;
                }

                // Check for existing user bookings
                _logger.LogInformation("Checking for existing user bookings for UserId: {UserId}", booking.CustomerId);
                var userBookings = await _bookingRepository.GetOfUserAsync(booking.CustomerId);
                _logger.LogInformation("Found {Count} existing bookings for user", userBookings.Count);

                // Log existing bookings
                foreach (var existingBooking in userBookings)
                {
                    _logger.LogInformation("Existing booking - Id: {BookingId}, StartDate: {StartDate}, EndDate: {EndDate}, Status: {Status}",
                        existingBooking.BookingId, existingBooking.StartDate, existingBooking.EndDate, existingBooking.Status);
                }

                // Check for overlap
                bool hasOverlap = userBookings.Any(existingBookings =>
                {
                    bool overlap = booking.StartDate < existingBookings.EndDate && booking.EndDate > existingBookings.StartDate;
                    if (overlap)
                    {
                        _logger.LogWarning("Overlap detected with booking {BookingId} - Existing: {ExistingStart} to {ExistingEnd}, New: {NewStart} to {NewEnd}",
                            existingBookings.BookingId, existingBookings.StartDate, existingBookings.EndDate, booking.StartDate, booking.EndDate);
                    }
                    return overlap;
                });

                if (hasOverlap)
                {
                    _logger.LogWarning("Booking rejected due to overlap");
                    return false;
                }
                _logger.LogInformation("No overlap detected, proceeding with booking creation");

                // Try to add to database
                _logger.LogInformation("Attempting to add booking to database");
                int rowsEffected = await _bookingRepository.AddAsync(newBooking);
                _logger.LogInformation("Database operation completed - Rows affected: {RowsAffected}", rowsEffected);

                bool success = rowsEffected > 0;
                _logger.LogInformation("AddBookingAsync result: {Success}", success);
                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in AddBookingAsync");
                return false;
            }
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
