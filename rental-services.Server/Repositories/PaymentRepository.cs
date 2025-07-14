using Microsoft.EntityFrameworkCore;

namespace rental_services.Server.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        Data.RentalContext _rentalContext;

        public PaymentRepository(Data.RentalContext rentalContext)
        {
            _rentalContext = rentalContext;
        }

        /// <summary>
        /// Materializes the list, do not use filtering or any query related clauses
        /// </summary>
        /// <returns></returns>
        public async Task<List<Models.Payment>> GetAllAsync()
        {
            return await _rentalContext.Payments.ToListAsync();
        }

        public async Task<Models.Payment?> GetByIdAsync(int id)
        {
            return await _rentalContext.Payments.FindAsync(id);
        }

        public async Task<int> AddAsync(Models.Payment peripheral)
        {
            await _rentalContext.Payments.AddAsync(peripheral);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> UpdateAsync(Models.Payment peripheral)
        {
            _rentalContext.Payments.Update(peripheral);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> SaveAsync()
        {
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> DeleteAsync(int id)
        {
            var peripheral = await _rentalContext.Payments.FindAsync(id);
            if (peripheral != null)
            {
                _rentalContext.Payments.Remove(peripheral);
                return await _rentalContext.SaveChangesAsync();
            }

            return 0;
        }

        public async Task<int> DeleteWithBookingAsync(int bookingId)
        {
            _rentalContext.Payments.RemoveRange(_rentalContext.Payments.Where(p => p.BookingId == bookingId));

            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<Models.Payment?> GetByBookingIdAsync(int bookingId)
        {
            // get only the upfront payment
            return await _rentalContext.Payments.Where(p => p.BookingId == bookingId).OrderBy(e => e.PaymentDate)
                                                                                //.Include(p => p.Booking)
                                                                                .FirstOrDefaultAsync();
        }
    }
}
