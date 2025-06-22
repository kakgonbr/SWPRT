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
            return await _rentalContext.VehicleModels.ToListAsync();
        }

        public async Task<Models.VehicleModel?> GetByIdAsync(int id)
        {
            return await _rentalContext.VehicleModels.FindAsync(id);
        }

        public async Task AddAsync(Models.VehicleModel product)
        {
            await _rentalContext.VehicleModels.AddAsync(product);
            await _rentalContext.SaveChangesAsync();
        }

        public async Task UpdateAsync(Models.VehicleModel product)
        {
            _rentalContext.VehicleModels.Update(product);
            await _rentalContext.SaveChangesAsync();
        }

        public async Task SaveAsync()
        {
            await _rentalContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var product = await _rentalContext.VehicleModels.FindAsync(id);
            if (product != null)
            {
                _rentalContext.VehicleModels.Remove(product);
                await _rentalContext.SaveChangesAsync();
            }
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
    }
}
