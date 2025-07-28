using Microsoft.EntityFrameworkCore;

namespace rental_services.Server.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly Data.RentalContext _rentalContext;

        public BookingRepository(Data.RentalContext rentalContext)
        {
            _rentalContext = rentalContext;
        }

        /// <summary>
        /// Materializes the list, do not use filtering or any query related clauses
        /// </summary>
        /// <returns></returns>
        public async Task<List<Models.Booking>> GetAllAsync()
        {
            return await _rentalContext.Bookings
                .Include(b => b.User)
                .Include(b => b.Payments)
                .Include(b => b.Peripherals)
                .Include(b => b.Vehicle)
                    .ThenInclude(v => v.Model)
                        .ThenInclude(v => v.Manufacturer)
                .ToListAsync();
        }

        public async Task<Models.Booking?> GetByIdAsync(int id)
        {
            return await _rentalContext.Bookings
                .Include(b => b.User)
                .Include(b => b.Payments)
                .Include(b => b.Peripherals)
                .Include(b => b.Vehicle)
                    .ThenInclude(v => v.Model)
                        .ThenInclude(v => v.Manufacturer)
                .SingleOrDefaultAsync(b => b.BookingId == id);
        }

        public async Task<List<Models.Booking>> GetOfUserAsync(int userId)
        {
            return await _rentalContext.Bookings
                .Include(b => b.User)
                .Include(b => b.Payments)
                .Include(b => b.Peripherals)
                .Include(b => b.Vehicle)
                    .ThenInclude(v => v.Model)
                        .ThenInclude(v => v.Manufacturer)
                .Where(b => b.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<Models.Booking>> GetUnpaid()
        {
            return await _rentalContext.Bookings.Where(b => b.Status == "Awaiting Payment")
                .Include(b => b.Vehicle)
                    .ThenInclude(b => b.Model)
                .ToListAsync();
        }

        public async Task<bool> CanBook(int userId, int vehicleId, DateOnly start, DateOnly end)
        {
            bool hasConflict = await _rentalContext.Bookings.AnyAsync(b =>
                (b.UserId == userId &&
                 (b.Status == "Awaiting Payment" || b.Status == "Active" || b.Status == "Upcoming"))
                ||
                (b.VehicleId == vehicleId && b.StartDate <= end && b.EndDate >= start)
            );

            if (hasConflict)
            {
                return false;
            }

            return await _rentalContext.Vehicles
                .Where(v => v.VehicleId == vehicleId)
                .Select(v => v.Model)
                .SelectMany(vm => vm.VehicleType.LicenseTypes)
                .AnyAsync(requiredLicenseType =>
                    _rentalContext.DriverLicenses
                        .Any(dl => dl.UserId == userId && dl.LicenseTypeId == requiredLicenseType.LicenseTypeId)
                );
        }

        public async Task<int> UpdateStatusAsync(int id, string status)
        {
            Models.Booking? dbBooking = await _rentalContext.Bookings.FindAsync(id);

            if (dbBooking is null)
            {
                return 0;
            }

            dbBooking.Status = status;

            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> AddAsync(Models.Booking booking)
        {
            await _rentalContext.Bookings.AddAsync(booking);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> UpdateAsync(Models.Booking booking)
        {
            _rentalContext.Bookings.Update(booking);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> SaveAsync()
        {
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> DeleteAsync(int id)
        {
            var booking = await _rentalContext.Bookings.FindAsync(id);
            if (booking != null)
            {
                _rentalContext.Bookings.Remove(booking);
                return await _rentalContext.SaveChangesAsync();
            }

            return 0;
        }
    }
}
