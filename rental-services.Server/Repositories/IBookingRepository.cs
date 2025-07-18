﻿using rental_services.Server.Models;

namespace rental_services.Server.Repositories
{
    public interface IBookingRepository
    {
        Task<int> AddAsync(Booking booking);
        Task<bool> CanBook(int userId, int vehicleId, DateOnly start, DateOnly end);
        Task<int> DeleteAsync(int id);
        Task<List<Booking>> GetAllAsync();
        Task<Booking?> GetByIdAsync(int id);
        Task<List<Booking>> GetOfUserAsync(int userId);
        Task<List<Booking>> GetUnpaid();
        Task<int> SaveAsync();
        Task<int> UpdateAsync(Booking booking);
        Task<int> UpdateStatusAsync(int id, string status);
    }
}