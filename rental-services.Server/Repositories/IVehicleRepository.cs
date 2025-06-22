namespace rental_services.Server.Repositories
{
    public interface IVehicleRepository
    {
        Task<List<Models.Vehicle>> GetAllAsync();
        Task<Models.Vehicle?> GetByIdAsync(int id);
        Task<int> AddAsync(Models.Vehicle product);
        Task<int> UpdateAsync(Models.Vehicle product);
        Task<int> DeleteAsync(int id);
        Task<int> SaveAsync();
    }
}
