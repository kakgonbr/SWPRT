using rental_services.Server.Models;

namespace rental_services.Server.Repositories
{
    public interface IPeripheralRepository
    {
        Task<int> AddAsync(Peripheral product);
        Peripheral AttachPeripheral(int peripheralId);
        Task<int> DeleteAsync(int id);
        Task<List<Peripheral>> GetAllAsync();
        Task<Peripheral?> GetByIdAsync(int id);
        Task<int> SaveAsync();
        Task<int> UpdateAsync(Peripheral product);
    }
}