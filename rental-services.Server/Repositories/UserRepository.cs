﻿using rental_services.Server.Data;
using rental_services.Server.Models;

namespace rental_services.Server.Repositories;

public class UserRepository : IUserRepository
{
    private readonly RentalContext _db;

    public UserRepository(RentalContext db)
    {
        _db = db;
    }

    public async Task<User> GetById(int id)
    {
        return await _db.Users.FindAsync(id);
    }

    public User GetBySub(string sub)
    {
        return _db.Users.FirstOrDefault(u => u.Sub == sub);
    }

    public void Add(User user)
    {
        _db.Users.Add(user);
        _db.SaveChanges();
    }

    public void Update(User user)
    {
        _db.Users.Update(user);
        _db.SaveChanges();
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
}