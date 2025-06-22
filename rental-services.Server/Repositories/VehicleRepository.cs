using Microsoft.EntityFrameworkCore;

namespace rental_services.Server.Repositories
{
    public class VehicleRepository : IVehicleRepository
    {
        private Data.RentalContext _rentalContext;

        public VehicleRepository(Data.RentalContext rentalContext)
        {
            _rentalContext = rentalContext;
        }

        /// <summary>
        /// Materializes the list, do not use filtering or any query related clauses
        /// </summary>
        /// <returns></returns>
        public async Task<List<Models.Vehicle>> GetAllAsync()
        {
            return await _rentalContext.Vehicles.ToListAsync();
        }

        public async Task<Models.Vehicle?> GetByIdAsync(int id)
        {
            return await _rentalContext.Vehicles.FindAsync(id);
        }

        public async Task AddAsync(Models.Vehicle product)
        {
            await _rentalContext.Vehicles.AddAsync(product);
            await _rentalContext.SaveChangesAsync();
        }

        public async Task UpdateAsync(Models.Vehicle product)
        {
            _rentalContext.Vehicles.Update(product);
            await _rentalContext.SaveChangesAsync();
        }

        public async void SaveAsync()
        {
            await _rentalContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var product = await _rentalContext.Vehicles.FindAsync(id);
            if (product != null)
            {
                _rentalContext.Vehicles.Remove(product);
                await _rentalContext.SaveChangesAsync();
            }
        }
    }
}
