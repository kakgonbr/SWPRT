using rental_services.Server.Models;

namespace rental_services.Server.Services;

public interface IUserService
{
    Task<User> GetUser(int id);
    // IEnumerable<User> GetAllUsers();
    void CreateUser(User user);
    void UpdateUser(User user);
    void DeleteUser(int id);
}