using rental_services.Server.Models;
namespace rental_services.Server.Repositories;

public interface IUserRepository
{
    Task<User?> GetById(int id);
    Task<User?> GetByEmail(string email);
    Task<User?> GetBySub(string sub);
    void Add(User user);
    Task<int> Update(User user);
    void Delete(int id);
    Task<List<User>> GetAll();
    Task<int> SaveAsync();
}