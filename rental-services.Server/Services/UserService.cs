using rental_services.Server.Models;
using rental_services.Server.Repositories;

namespace rental_services.Server.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<User> GetUser(int id)
    {
        // Example business logic (can add more later)
        return await _userRepository.GetById(id);
    }

    public void CreateUser(User user)
    {
        // Possible business validation goes here
        _userRepository.Add(user);
    }

    public void UpdateUser(User user)
    {
        // Possible business logic/validation
        _userRepository.Update(user);
    }

    public void DeleteUser(int id)
    {
        _userRepository.Delete(id);
    }

    public async Task<User?> GetUserBySub(string sub)
    {
        return await _userRepository.GetBySub(sub);
    }
}