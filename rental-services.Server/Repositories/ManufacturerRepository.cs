using Microsoft.EntityFrameworkCore;

namespace rental_services.Server.Repositories
{
    public class ManufacturerRepository : IManufacturerRepository
    {
        private readonly Data.RentalContext _rentalContext;

        public ManufacturerRepository(Data.RentalContext rentalContext)
        {
            _rentalContext = rentalContext;
        }

        /// <summary>
        /// Materializes the list, do not use filtering or any query related clauses
        /// </summary>
        /// <returns></returns>
        public async Task<List<Models.Manufacturer>> GetAllAsync()
        {
            return await _rentalContext.Manufacturers
                .ToListAsync();
        }

        public async Task<Models.Manufacturer?> GetByIdAsync(int id)
        {
            return await _rentalContext.Manufacturers
                .SingleOrDefaultAsync(b => b.ManufacturerId == id);
        }

        public async Task<int> AddAsync(Models.Manufacturer manufacturer)
        {
            await _rentalContext.Manufacturers.AddAsync(manufacturer);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> UpdateAsync(Models.Manufacturer manufacturer)
        {
            _rentalContext.Manufacturers.Update(manufacturer);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> SaveAsync()
        {
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> DeleteAsync(int id)
        {
            var manufacturer = await _rentalContext.Manufacturers.FindAsync(id);
            if (manufacturer != null)
            {
                _rentalContext.Manufacturers.Remove(manufacturer);
                return await _rentalContext.SaveChangesAsync();
            }

            return 0;
        }
    }
}
