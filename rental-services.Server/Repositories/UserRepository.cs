using Microsoft.EntityFrameworkCore;
using rental_services.Server.Data;
using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Repositories;

public class UserRepository : IUserRepository
{
    private readonly RentalContext _db;

    public UserRepository(RentalContext db)
    {
        _db = db;
    }

    public async Task<User?> GetById(int id)
    {
        return await _db.Users
            .Include(u => u.DriverLicenses)
            .SingleOrDefaultAsync(u => u.UserId == id);
    }
    
    public async Task<User?> GetByEmail(string email)
    {
        return await _db.Users
            .Include(u => u.DriverLicenses)
            .SingleOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetBySub(string sub)
    {
        return await _db.Users.SingleOrDefaultAsync(u => u.Sub.Equals(sub));
    }

    public void Add(User user)
    {
        _db.Users.Add(user);
        _db.SaveChanges();
    }

    public async Task<int> Update(User user)
    {
        _db.Users.Update(user);
        return await _db.SaveChangesAsync();
    }

    public async void Delete(int id)
    {
        var user = await GetById(id);
        if (user != null)
        {
            _db.Users.Remove(user);
            _db.SaveChanges();
        }
    }

    public async Task<List<User>> GetAll()
    {
        return await _db.Users.ToListAsync();
    }

    public async Task<int> SaveAsync()
    {
        return await _db.SaveChangesAsync();
    }

}