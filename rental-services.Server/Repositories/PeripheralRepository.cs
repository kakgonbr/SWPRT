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

        public async Task AddAsync(Models.Peripheral product)
        {
            await _rentalContext.Peripherals.AddAsync(product);
            await _rentalContext.SaveChangesAsync();
        }

        public async Task UpdateAsync(Models.Peripheral product)
        {
            _rentalContext.Peripherals.Update(product);
            await _rentalContext.SaveChangesAsync();
        }

        public async Task SaveAsync()
        {
            await _rentalContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var product = await _rentalContext.Peripherals.FindAsync(id);
            if (product != null)
            {
                _rentalContext.Peripherals.Remove(product);
                await _rentalContext.SaveChangesAsync();
            }
        }

        public Models.Peripheral AttachPeripheral(int peripheralId)
        {
            Models.Peripheral peripheral = new() { PeripheralId = peripheralId };
            _rentalContext.Attach(peripheral);

            return peripheral;
        }
    }
}
