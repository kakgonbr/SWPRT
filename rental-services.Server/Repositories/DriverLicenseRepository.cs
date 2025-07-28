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

    public async Task<List<DriverLicense>> GetByUser(int userId)
    {
        return await _context.DriverLicenses.Where(dl => dl.UserId == userId).Include(dl => dl.LicenseType).ToListAsync();
    }

    public async Task<int> DeleteLicense(int userId, string licenseId)
    {
        var dbLicense = await _context.DriverLicenses.SingleOrDefaultAsync(dl => dl.LicenseId == licenseId && dl.UserId == userId);

        if (dbLicense is null || dbLicense.UserId != userId)
        {
            return 0;
        }

        _context.DriverLicenses.Remove(dbLicense);

        return await _context.SaveChangesAsync();
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