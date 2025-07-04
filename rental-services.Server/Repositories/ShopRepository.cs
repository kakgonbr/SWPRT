using Microsoft.EntityFrameworkCore;

namespace rental_services.Server.Repositories
{
    public class ShopRepository : IShopRepository
    {
        private readonly Data.RentalContext _rentalContext;

        public ShopRepository(Data.RentalContext rentalContext)
        {
            _rentalContext = rentalContext;
        }

        /// <summary>
        /// Materializes the list, do not use filtering or any query related clauses
        /// </summary>
        /// <returns></returns>
        public async Task<List<Models.Shop>> GetAllAsync()
        {
            return await _rentalContext.Shops
                .ToListAsync();
        }

        public async Task<Models.Shop?> GetByIdAsync(int id)
        {
            return await _rentalContext.Shops
                .SingleOrDefaultAsync(b => b.Shopid == id);
        }

        public async Task<int> AddAsync(Models.Shop shop)
        {
            await _rentalContext.Shops.AddAsync(shop);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> UpdateAsync(Models.Shop shop)
        {
            _rentalContext.Shops.Update(shop);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> SaveAsync()
        {
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> DeleteAsync(int id)
        {
            var shop = await _rentalContext.Shops.FindAsync(id);
            if (shop != null)
            {
                _rentalContext.Shops.Remove(shop);
                return await _rentalContext.SaveChangesAsync();
            }

            return 0;
        }
    }
}
