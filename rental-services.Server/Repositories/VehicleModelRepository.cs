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

        public async Task<int> AddAsync(Models.VehicleModel vehicleModel)
        {
            await _rentalContext.VehicleModels.AddAsync(vehicleModel);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> UpdateAsync(Models.VehicleModel vehicleModel)
        {
            _rentalContext.VehicleModels.Update(vehicleModel);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> SaveAsync()
        {
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> DeleteAsync(int id)
        {
            var vehicleModel = await _rentalContext.VehicleModels.FindAsync(id);
            if (vehicleModel != null)
            {
                _rentalContext.VehicleModels.Remove(vehicleModel);
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

        public async Task<List<Models.VehicleModel>> GetAllEagerShopTypeAsync()
        {
            return await _rentalContext.VehicleModels
                .Where(vm => vm.IsAvailable)
                .Include(vm => vm.Shop)
                .Include(vm => vm.VehicleType)
                .Include(vm => vm.Manufacturer)
                .ToListAsync();
        }

        public async Task<List<Models.VehicleModel>> GetAllEagerShopTypeAsync(string searchTerm)
        {
            var loweredTerm = searchTerm.ToLower();
            return await _rentalContext.VehicleModels
                .Where(vm => vm.IsAvailable &&
                    (
                        vm.ModelName.ToLower().Contains(loweredTerm) ||
                        vm.Description.ToLower().Contains(loweredTerm) ||
                        vm.Manufacturer.ManufacturerName.ToLower().Contains(loweredTerm)
                    )
                )
                .Include(vm => vm.Shop)
                .Include(vm => vm.VehicleType)
                .Include(vm => vm.Manufacturer)
                .ToListAsync();
        }
    }
}
