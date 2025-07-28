using System.Threading.Tasks;
using rental_services.Server.Models;

public interface IDriverLicenseRepository
{
    Task<DriverLicenseType?> GetLicenseTypeByCodeAsync(string licenseClass);
    Task<DriverLicense?> GetByUserAndTypeAsync(int userId, int licenseTypeId);
    Task AddAsync(DriverLicense license);
    Task SaveChangesAsync();
    Task<List<DriverLicense>> GetByUser(int userId);
    Task<int> DeleteLicense(int userId, string licenseId);
} 