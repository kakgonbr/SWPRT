using Microsoft.EntityFrameworkCore;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Data;
using rental_services.Server.Models;
using System.Threading.Tasks;

namespace rental_services.Server.Services
{
    public class OcrService : IOcrService
    {
        private readonly RentalContext _context;
        private readonly IDriverLicenseRepository _driverLicenseRepository;

        public OcrService(RentalContext context, IDriverLicenseRepository driverLicenseRepository)
        {
            _context = context;
            _driverLicenseRepository = driverLicenseRepository;
        }

        public async Task ProcessGplxDataAsync(int userId, GplxData gplxData)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                throw new BadHttpRequestException("Không tìm thấy người dùng từ thông tin xác thực.");
            }

            // Cập nhật thông tin người dùng
            user.FullName = gplxData.FullName ?? user.FullName;
            user.Address = gplxData.Address ?? user.Address;
            if (DateTime.TryParse(gplxData.DateOfBirth, out var dob))
            {
                user.DateOfBirth = DateOnly.FromDateTime(dob);
            }

            // Cập nhật/Thêm bằng lái
            var licenseType = await _driverLicenseRepository.GetLicenseTypeByCodeAsync(gplxData.LicenseClass);

            if (licenseType == null)
            {
                throw new BadHttpRequestException($"Driver's license class '{gplxData.LicenseClass}' is not supported or could not be recognized.");
            }

            var existingLicense = await _driverLicenseRepository.GetByUserAndTypeAsync(user.UserId, licenseType.LicenseTypeId);

            if (existingLicense == null)
            {
                var newLicense = new DriverLicense
                {
                    UserId = user.UserId,
                    LicenseTypeId = licenseType.LicenseTypeId,
                    LicenseId = gplxData.LicenseNumber,
                    HolderName = gplxData.FullName,
                    DateOfIssue = DateTime.TryParse(gplxData.DateOfIssue, out var doi) ? DateOnly.FromDateTime(doi) : DateOnly.FromDateTime(DateTime.Now),
                };
                await _driverLicenseRepository.AddAsync(newLicense);
            }
            else
            {
                existingLicense.LicenseId = gplxData.LicenseNumber ?? existingLicense.LicenseId;
                existingLicense.HolderName = gplxData.FullName ?? existingLicense.HolderName;
                if (DateTime.TryParse(gplxData.DateOfIssue, out var doi))
                {
                    existingLicense.DateOfIssue = DateOnly.FromDateTime(doi);
                }
            }

            await _driverLicenseRepository.SaveChangesAsync();
        }
    }
} 