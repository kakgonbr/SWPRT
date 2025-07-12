namespace rental_services.Server.Services
{
    public class RentalService : IRentalService
    {
        private Repositories.IBookingRepository _bookingRepository;
        private Repositories.IPeripheralRepository _peripheralRepository;
        private IBikeService _bikeService;
        private AutoMapper.IMapper _mapper;
        private readonly ILogger<RentalService> _logger;
        private readonly Repositories.IVehicleModelRepository _vehicleModelRepository;
        private static HashSet<RentalTracker> rentalTrackers = new();

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

            public override string ToString()
            {
                return $"Tracker: BID : {BookingId}, UID: {UserId}, AMNT: {Amount}, TRIES: {Tries}";
            }
        }


        public RentalService(Repositories.IBookingRepository bookingRepository, AutoMapper.IMapper mapper,
            Repositories.IPeripheralRepository peripheralRepository,
            Repositories.IVehicleModelRepository vehicleModelRepository,
            IBikeService bikeService,
            ILogger<RentalService> logger)
        {
            _bookingRepository = bookingRepository;
            _mapper = mapper;
            _peripheralRepository = peripheralRepository;
            _logger = logger;
            _vehicleModelRepository = vehicleModelRepository;
            _bikeService = bikeService;
        }

        public async Task<bool> AddBookingAsync(Models.DTOs.BookingDTO booking)
        {
            try
            {
                // Log the incoming booking data
                _logger.LogInformation("AddBookingAsync called with booking data: {@Booking}", booking);
                _logger.LogInformation(
                    "Booking details - CustomerId: {CustomerId}, BikeId: {BikeId}, VehicleModelId: {VehicleModelId}, StartDate: {StartDate}, EndDate: {EndDate}",
                    booking.CustomerId, booking.BikeId, booking.VehicleModelId, booking.StartDate, booking.EndDate);

                // Check date validation
                if (booking.StartDate >= booking.EndDate)
                {
                    _logger.LogWarning("Date validation failed - StartDate: {StartDate} >= EndDate: {EndDate}",
                        booking.StartDate, booking.EndDate);
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
                    _logger.LogInformation(
                        "Mapped booking details - BookingId: {BookingId}, UserId: {UserId}, VehicleId: {VehicleId}, StartDate: {StartDate}, EndDate: {EndDate}, Status: {Status}",
                        newBooking.BookingId, newBooking.UserId, newBooking.VehicleId, newBooking.StartDate,
                        newBooking.EndDate, newBooking.Status);
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
                    _logger.LogInformation(
                        "Existing booking - Id: {BookingId}, StartDate: {StartDate}, EndDate: {EndDate}, Status: {Status}",
                        existingBooking.BookingId, existingBooking.StartDate, existingBooking.EndDate,
                        existingBooking.Status);
                }

                // Check for overlap
                bool hasOverlap = userBookings.Any(existingBookings =>
                {
                    bool overlap = booking.StartDate < existingBookings.EndDate &&
                                   booking.EndDate > existingBookings.StartDate;
                    if (overlap)
                    {
                        _logger.LogWarning(
                            "Overlap detected with booking {BookingId} - Existing: {ExistingStart} to {ExistingEnd}, New: {NewStart} to {NewEnd}",
                            existingBookings.BookingId, existingBookings.StartDate, existingBookings.EndDate,
                            booking.StartDate, booking.EndDate);
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
            if (!Utils.Config.BookingStatus.IsValid(status))
            {
                return false;
            }

            return await _bookingRepository.UpdateStatusAsync(id, status) != 0;
        }

        public enum CreateRentalResult
        {
            CREATE_SUCCESS,
            ALREADY_EXIST,
            CREATE_FAILURE
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
        public async Task<CreateRentalResult> CreateRentalAsync(int userId, int modelId, DateOnly start, DateOnly end, string? pickupLocation)
        {
            int vehicleId = await _bikeService.AssignAvailableVehicleAsync(modelId, start, end, pickupLocation) ?? 0;
                //(await _vehicleModelRepository.GetByIdAsync(modelId))?.Vehicles?.FirstOrDefault()?.ModelId ?? 0;

            if (vehicleId == 0)
            {
                return CreateRentalResult.CREATE_FAILURE;
            }

            Models.VehicleModel? model = await _vehicleModelRepository.GetByIdAsync(modelId);

            if (model is null)
            {
                // cant be
                return CreateRentalResult.CREATE_FAILURE;
            }

            // round down? idk
            long amount = (long)(model.RatePerDay * (model.UpFrontPercentage / 100d));

            RentalTracker? existing = rentalTrackers.Where(rt => rt.UserId == userId).FirstOrDefault();

            if (existing is not null)
            {
                return CreateRentalResult.ALREADY_EXIST;
            }

            if (!await _bookingRepository.CanBook(userId, vehicleId, start, end))
            {
                return CreateRentalResult.CREATE_FAILURE;
            }

            Models.Booking newBooking = new Models.Booking()
                { BookingId = 0, UserId = userId, VehicleId = vehicleId, StartDate = start, EndDate = end, Status = Utils.Config.BookingStatus.AwaitingPayment };

            // would throw and end the request if database validations fail, a little rough but saves quite a bit of code, functionality wise, it is acceptable.
            await _bookingRepository.AddAsync(newBooking);

            rentalTrackers.Add(new RentalTracker()
                { BookingId = newBooking.BookingId, UserId = userId, Amount = amount });

            return CreateRentalResult.CREATE_SUCCESS;
        }

        public async Task<string?> GetPaymentLinkAsync(int userId, string userIp)
        {
            _logger.LogInformation("{Trackers}", rentalTrackers);

            RentalTracker? existing = rentalTrackers.Where(rt => rt.UserId == userId).FirstOrDefault();

            if (existing is null)
            {
                return null;
            }

            _logger.LogInformation("{Tracker}", existing);

            Models.Booking? dbBooking = await _bookingRepository.GetByIdAsync(existing.BookingId);

            if (dbBooking is null)
            {
                return null;
            }

            return existing is null
                ? null
                : VNPayService.GetLink(userIp, null, existing.Amount * 100, null,
                    string.Join("_", existing.BookingId, existing.Tries));
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
                    rentalTrackers.Remove(tracker);
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

            rentalTrackers.Remove(existing);
            dbBooking.Status = Utils.Config.BookingStatus.Upcoming;

            return true;
        }
    }
}