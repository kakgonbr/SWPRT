using rental_services.Server.Models;

namespace rental_services.Server.Repositories
{
    public interface IPeripheralRepository
    {
        Task AddAsync(Peripheral product);
        Peripheral AttachPeripheral(int peripheralId);
        Task DeleteAsync(int id);
        Task<List<Peripheral>> GetAllAsync();
        Task<Peripheral?> GetByIdAsync(int id);
        Task SaveAsync();
        Task UpdateAsync(Peripheral product);
    }
}