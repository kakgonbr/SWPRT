using Microsoft.EntityFrameworkCore;


namespace rental_services.Server.Repositories
{
    public class PeripheralRepository : IPeripheralRepository
    {
        Data.RentalContext _rentalContext;

        public PeripheralRepository(Data.RentalContext rentalContext)
        {
            _rentalContext = rentalContext;
        }

        /// <summary>
        /// Materializes the list, do not use filtering or any query related clauses
        /// </summary>
        /// <returns></returns>
        public async Task<List<Models.Peripheral>> GetAllAsync()
        {
            return await _rentalContext.Peripherals.ToListAsync();
        }

        public async Task<Models.Peripheral?> GetByIdAsync(int id)
        {
            return await _rentalContext.Peripherals.FindAsync(id);
        }

        public async Task<int> AddAsync(Models.Peripheral peripheral)
        {
            await _rentalContext.Peripherals.AddAsync(peripheral);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> UpdateAsync(Models.Peripheral peripheral)
        {
            _rentalContext.Peripherals.Update(peripheral);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> SaveAsync()
        {
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> DeleteAsync(int id)
        {
            var peripheral = await _rentalContext.Peripherals.FindAsync(id);
            if (peripheral != null)
            {
                _rentalContext.Peripherals.Remove(peripheral);
                return await _rentalContext.SaveChangesAsync();
            }

            return 0;
        }

        public Models.Peripheral AttachPeripheral(int peripheralId)
        {
            Models.Peripheral peripheral = new() { PeripheralId = peripheralId };
            _rentalContext.Attach(peripheral);

            return peripheral;
        }
    }
}
