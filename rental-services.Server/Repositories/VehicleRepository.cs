using Microsoft.EntityFrameworkCore;

namespace rental_services.Server.Repositories
{
    public class VehicleRepository : IVehicleRepository
    {
        private readonly Data.RentalContext _rentalContext;

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

        public async Task<Models.Vehicle> AddAsync(Models.Vehicle vehicle)
        {
            await _rentalContext.Vehicles.AddAsync(vehicle);
            return vehicle;
        }

        public async Task<int> UpdateAsync(Models.Vehicle vehicle)
        {
            _rentalContext.Vehicles.Update(vehicle);
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> SaveAsync()
        {
            return await _rentalContext.SaveChangesAsync();
        }

        public async Task<int> DeleteAsync(int id)
        {
            var vehicle = await _rentalContext.Vehicles.FindAsync(id);
            if (vehicle != null)
            {
                _rentalContext.Vehicles.Remove(vehicle);
                return await _rentalContext.SaveChangesAsync();
            }

            return 0;
        }

        public void DeleteRange(List<Models.Vehicle> toDelete)
        {
            _rentalContext.Vehicles.RemoveRange(toDelete);
        }
    }
}
