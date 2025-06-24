using Microsoft.EntityFrameworkCore;

namespace rental_services.Server.Repositories
{
    public class VehicleModelRepository : IVehicleModelRepository
    {
        private Data.RentalContext _rentalContext;

        public VehicleModelRepository(Data.RentalContext rentalContext)
        {
            _rentalContext = rentalContext;
        }

        /// <summary>
        /// Materializes the list, do not use filtering or any query related clauses
        /// </summary>
        /// <returns></returns>
        public async Task<List<Models.VehicleModel>> GetAllAsync()
        {
            return await _rentalContext.VehicleModels
                .Include(vm => vm.Manufacturer)
                .Include(vm => vm.Shop)
                .ToListAsync();
        }

        public async Task<Models.VehicleModel?> GetByIdAsync(int id)
        {
            return await _rentalContext.VehicleModels
                .Include(vm => vm.Manufacturer)
                .Include(vm => vm.Peripherals)
                .Include(vm => vm.Shop)
                .SingleOrDefaultAsync(vm => vm.ModelId == id);
        }

        public async Task<int> AddAsync(Models.VehicleModel product)
        {
            await _rentalContext.VehicleModels.AddAsync(product);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> UpdateAsync(Models.VehicleModel product)
        {
            _rentalContext.VehicleModels.Update(product);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> SaveAsync()
        {
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> DeleteAsync(int id)
        {
            var product = await _rentalContext.VehicleModels.FindAsync(id);
            if (product != null)
            {
                _rentalContext.VehicleModels.Remove(product);
                return await _rentalContext.SaveChangesAsync();
            }

            return 0;
        }

        public async Task<List<Models.Vehicle>> GetOfModelAsync(Models.VehicleModel model)
        {
            return await _rentalContext.Vehicles.Where(v => v.Model == model)
                                                .ToListAsync();
        }

        public async Task<List<Models.Vehicle>> GetOfModelAsync(int modelId)
        {
            return await _rentalContext.Vehicles.Where(v => v.ModelId == modelId).ToListAsync();
        }
        
        /// <summary>
        /// return vehicle list follow the vehicle model id
        /// </summary>
        /// <param name="modelId"></param>
        /// <returns></returns>
        public async Task<List<Models.Vehicle>> GetOfModelEagerBookingAsync(int modelId)
        {
            return await _rentalContext.Vehicles
                .Where(v => v.ModelId == modelId)
                .Include(v => v.Bookings)
                .ToListAsync();
        }

        public async Task<List<Models.VehicleModel>> GetAllEagerShopAsync()
        {
            return await _rentalContext.VehicleModels.Where(vm => vm.IsAvailable).Include(v => v.Shop).ToListAsync();
        }
    }
}
