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

        public OcrService(RentalContext context)
        {
            _context = context;
        }

        public async Task ProcessGplxDataAsync(string userSub, GplxData gplxData)
        {
            var licenseType = await _context.DriverLicenseTypes
                .FirstOrDefaultAsync(lt => lt.LicenseTypeCode == gplxData.LicenseClass);

            if (licenseType == null)
            {
                throw new BadHttpRequestException($"Hạng bằng lái '{gplxData.LicenseClass}' không được hỗ trợ hoặc không nhận dạng được.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Sub == userSub);
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
            var existingLicense = await _context.DriverLicenses
                .FirstOrDefaultAsync(dl => dl.UserId == user.UserId && dl.LicenseTypeId == licenseType.LicenseTypeId);

            if (existingLicense == null)
            {
                var newLicense = new DriverLicense
                {
                    UserId = user.UserId,
                    LicenseTypeId = licenseType.LicenseTypeId,
                    LicenseId = gplxData.LicenseNumber,
                    HolderName = gplxData.FullName,
                    DateOfIssue = DateTime.TryParse(gplxData.DateOfIssue, out var doi) ? DateOnly.FromDateTime(doi) : DateOnly.FromDateTime(DateTime.Now),
                    //ImageLicenseUrl = gplxData.ImageUrl ?? imageUrl
                };
                _context.DriverLicenses.Add(newLicense);
            }
            else
            {
                existingLicense.LicenseId = gplxData.LicenseNumber ?? existingLicense.LicenseId;
                existingLicense.HolderName = gplxData.FullName ?? existingLicense.HolderName;
                if (DateTime.TryParse(gplxData.DateOfIssue, out var doi))
                {
                    existingLicense.DateOfIssue = DateOnly.FromDateTime(doi);
                }
                //existingLicense.ImageLicenseUrl = gplxData.ImageUrl ?? imageUrl;
            }
            
            await _context.SaveChangesAsync();
        }
    }
} 