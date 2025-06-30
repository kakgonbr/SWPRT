using Microsoft.EntityFrameworkCore;

namespace rental_services.Server.Repositories
{
    public class BannerRepository : IBannerRepository
    {
        private readonly Data.RentalContext _rentalContext;

        public BannerRepository(Data.RentalContext rentalContext)
        {
            _rentalContext = rentalContext;
        }

        /// <summary>
        /// Materializes the list, do not use filtering or any query related clauses
        /// </summary>
        /// <returns></returns>
        public async Task<List<Models.Banner>> GetAllAsync()
        {
            return await _rentalContext.Banners
                .ToListAsync();
        }

        public async Task<Models.Banner?> GetByIdAsync(int id)
        {
            return await _rentalContext.Banners
                .SingleOrDefaultAsync(b => b.BannerId == id);
        }

        public async Task<int> AddAsync(Models.Banner booking)
        {
            await _rentalContext.Banners.AddAsync(booking);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> UpdateAsync(Models.Banner booking)
        {
            _rentalContext.Banners.Update(booking);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> SaveAsync()
        {
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> DeleteAsync(int id)
        {
            var booking = await _rentalContext.Banners.FindAsync(id);
            if (booking != null)
            {
                _rentalContext.Banners.Remove(booking);
                return await _rentalContext.SaveChangesAsync();
            }

            return 0;
        }
    }
}
