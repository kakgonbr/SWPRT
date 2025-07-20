using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Services;

public interface IUserService
{
    Task<UserDto> GetUser(int id);
    Task<UserDto> GetUser(string email);
    // IEnumerable<User> GetAllUsers();
    void CreateUser(User user);
    Task<bool> UpdateUser(UserDto user);
    void DeleteUser(int id);
    Task<User?> GetUserBySubAsync(string sub);
    Task<List<UserDto>> GetAll();
}