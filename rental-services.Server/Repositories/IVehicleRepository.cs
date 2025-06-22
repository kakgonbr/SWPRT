namespace rental_services.Server.Repositories
{
    public interface IVehicleRepository
    {
        Task<List<Models.Vehicle>> GetAllAsync();
        Task<Models.Vehicle?> GetByIdAsync(int id);
        Task AddAsync(Models.Vehicle product);
        Task UpdateAsync(Models.Vehicle product);
        Task DeleteAsync(int id);
        void SaveAsync();
    }
}
