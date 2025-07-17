using Microsoft.EntityFrameworkCore;
using rental_services.Server.Data;
using rental_services.Server.Models;
using System.Threading.Tasks;

public class DriverLicenseRepository : IDriverLicenseRepository
{
    private readonly RentalContext _context;

    public DriverLicenseRepository(RentalContext context)
    {
        _context = context;
    }

    public async Task<DriverLicenseType?> GetLicenseTypeByCodeAsync(string licenseClass)
    {
        return await _context.DriverLicenseTypes
            .FirstOrDefaultAsync(lt => lt.LicenseTypeCode == licenseClass);
    }

    public async Task<DriverLicense?> GetByUserAndTypeAsync(int userId, int licenseTypeId)
    {
        return await _context.DriverLicenses
            .FirstOrDefaultAsync(dl => dl.UserId == userId && dl.LicenseTypeId == licenseTypeId);
    }

    public async Task AddAsync(DriverLicense license)
    {
        await _context.DriverLicenses.AddAsync(license);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
} 