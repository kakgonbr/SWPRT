using Microsoft.EntityFrameworkCore;

namespace rental_services.Server.Repositories
{
    public class VehicleTypeRepository : IVehicleTypeRepository
    {
        private readonly Data.RentalContext _rentalContext;

        public VehicleTypeRepository(Data.RentalContext rentalContext)
        {
            _rentalContext = rentalContext;
        }

        /// <summary>
        /// Materializes the list, do not use filtering or any query related clauses
        /// </summary>
        /// <returns></returns>
        public async Task<List<Models.VehicleType>> GetAllAsync()
        {
            return await _rentalContext.VehicleTypes
                .ToListAsync();
        }

        public async Task<Models.VehicleType?> GetByIdAsync(int id)
        {
            return await _rentalContext.VehicleTypes
                .SingleOrDefaultAsync(b => b.VehicleTypeId == id);
        }

        public async Task<int> AddAsync(Models.VehicleType vehicleType)
        {
            await _rentalContext.VehicleTypes.AddAsync(vehicleType);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> UpdateAsync(Models.VehicleType vehicleType)
        {
            _rentalContext.VehicleTypes.Update(vehicleType);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> SaveAsync()
        {
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> DeleteAsync(int id)
        {
            var vehicleType = await _rentalContext.VehicleTypes.FindAsync(id);
            if (vehicleType != null)
            {
                _rentalContext.VehicleTypes.Remove(vehicleType);
                return await _rentalContext.SaveChangesAsync();
            }

            return 0;
        }
    }
}
