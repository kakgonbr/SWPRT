namespace rental_services.Server.Services
{
    public class RentalService : IRentalService
    {
        /// <summary>
        /// For tracking unpaid bookings
        /// </summary>
        private class RentalTracker
        {
            private readonly DateTime _createdAt;

            public RentalTracker()
            {
                _createdAt = DateTime.Now;
            }

            public RentalTracker(Models.Booking booking)
            {
                _createdAt = DateTime.Now;

                BookingId = booking.BookingId;
                UserId = booking.UserId;
            }

            public bool IsExpired
            {
                get
                {
                    return DateTime.Now - _createdAt >= TimeSpan.FromMinutes(Utils.Config.VnpConfig.PAYMENT_TIMEOUT_MIN);
                }
            }

            public int BookingId { get; init; }
            public int UserId { get; init; }
            public int Tries { get; set; } = 0;
            public long Amount { get; init; }

            public override bool Equals(object? obj)
            {
                if (obj is RentalTracker other)
                    return BookingId == other.BookingId;

                return false;
            }

            public override int GetHashCode()
            {
                return BookingId;
            }
        }

        private readonly Repositories.IBookingRepository _bookingRepository;
        private readonly Repositories.IPeripheralRepository _peripheralRepository;
        private readonly Repositories.IVehicleModelRepository _vehicleModelRepository;
        private readonly AutoMapper.IMapper _mapper;
        private readonly ILogger<RentalService> _logger;
        private readonly HashSet<RentalTracker> rentalTrackers = new();

        public RentalService(Repositories.IBookingRepository bookingRepository, AutoMapper.IMapper mapper,
            Repositories.IPeripheralRepository peripheralRepository, Repositories.IVehicleModelRepository vehicleModelRepository,
            ILogger<RentalService> logger)
        {
            _bookingRepository = bookingRepository;
            _mapper = mapper;
            _peripheralRepository = peripheralRepository;
            _vehicleModelRepository = vehicleModelRepository;
            _logger = logger;
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
            return await _bookingRepository.UpdateStatusAsync(id, status) != 0;
        }
        
        /// <summary>
        /// For creating a new rental, before payment<br></br>
        /// The amount parameter must be calculated before calling this method.
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="modelId"></param>
        /// <param name="start"></param>
        /// <param name="end"></param>
        /// <param name="amount"></param>
        /// <returns></returns>
        public async Task<bool> CreateRentalAsync(int userId, int modelId, DateOnly start, DateOnly end)
        {
            // TODO: CURRENTLY STUB, REPLACE WITH SCHEDULING LOGIC
            int vehicleId = (await _vehicleModelRepository.GetByIdAsync(modelId))?.Vehicles?.FirstOrDefault()?.ModelId ?? 0;

            // TODO: CALCULATE AMOUNT
            long amount = 10_000;

            RentalTracker? existing = rentalTrackers.Where(rt => rt.UserId == userId).FirstOrDefault();

            if (existing is not null)
            {
                return false;
            }

            Models.Booking newBooking = new Models.Booking() { BookingId = 0, UserId = userId, VehicleId = vehicleId, StartDate = start, EndDate = end };

            await _bookingRepository.AddAsync(newBooking);

            rentalTrackers.Add(new RentalTracker() { BookingId = newBooking.BookingId, UserId = userId, Amount = amount });

            return true;
        }

        public async Task<string?> GetPaymentLinkAsync(int userId, string userIp)
        {
            RentalTracker? existing = rentalTrackers.Where(rt => rt.UserId == userId).FirstOrDefault();

            if (existing is null)
            {
                return null;
            }

            Models.Booking? dbBooking = await _bookingRepository.GetByIdAsync(existing.BookingId);

            if (dbBooking is null)
            {
                return null;
            }

            return existing is null ? null : VNPayService.GetLink(userIp, null, existing.Amount * 100, null, string.Join("_", existing.BookingId, existing.Tries));
        }

        /// <summary>
        /// called periodically
        /// </summary>
        /// <returns></returns>
        public async Task CleanupPendingAsync()
        {
            foreach (var tracker in rentalTrackers)
            {
                if (tracker.IsExpired)
                {
                    _logger.LogInformation("Clearing tracker for {BookingId}", tracker.BookingId);

                    await _bookingRepository.DeleteAsync(tracker.BookingId);
                }
            }
        }

        /// <summary>
        /// For when payment fails
        /// </summary>
        /// <param name="bookingId"></param>
        /// <returns></returns>
        public async Task InformPaymentFailureAsync(int bookingId)
        {
            RentalTracker? existing = null;

            rentalTrackers.TryGetValue(new RentalTracker() { BookingId = bookingId }, out existing);

            if (existing is null)
            {
                return;
            }

            existing.Tries += 1;

            if (existing.Tries < 3)
            {
                return;
            }

            _logger.LogInformation("Clearing tracker for {BookingId}, tries exceeded", existing.BookingId);

            await _bookingRepository.DeleteAsync(bookingId);

            rentalTrackers.Remove(new RentalTracker() { BookingId = bookingId });
        }

        /// <summary>
        /// Called after receiving payment
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="amount"></param>
        /// <returns>false if the payment should be refunded, true if otherwise</returns>
        public async Task<bool> InformPaymentSuccessAsync(int userId, long amount)
        {
            RentalTracker? existing = rentalTrackers.Where(rt => rt.UserId == userId).FirstOrDefault();

            if (existing is null || existing.Amount != amount)
            {
                return false;
            }

            Models.Booking? dbBooking = await _bookingRepository.GetByIdAsync(existing.BookingId);

            if (dbBooking is null)
            {
                return false;
            }

            // might move this into a centralized config file instead
            dbBooking.Status = "Upcoming";

            return true;
        }
    }
}
