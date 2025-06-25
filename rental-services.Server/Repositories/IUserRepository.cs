using rental_services.Server.Models;

namespace rental_services.Server.Repositories;

public interface IUserRepository
{
    Task<User> GetById(int id);
    Task<User?> GetBySub(string sub);
    void Add(User user);
    void Update(User user);
    void Delete(int id);
}