using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Tesseract;
using System.Text.RegularExpressions;
using rental_services.Server.Data;
using rental_services.Server.Models;
using Microsoft.EntityFrameworkCore;
using rental_services.Server.Services;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Utils;

namespace rental_services.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OcrController : ControllerBase
    {
        private readonly IOcrService _ocrService;
        private readonly ILogger<OcrController> _logger;
        DriverLicenseRepository _driverLicenseRepository = new DriverLicenseRepository(new RentalContext());

        public OcrController(IOcrService ocrService, ILogger<OcrController> logger)
        {
            _ocrService = ocrService;
            _logger = logger;
        }

        [Authorize]
        [HttpPost("upload-license")]
        public async Task<IActionResult> UploadAndProcessLicense(IFormFile image)
        {
            string extractedText;
            try
            {
                // Đọc ảnh vào memory stream thay vì lưu file
                using (var memoryStream = new MemoryStream())
                {
                    await image.CopyToAsync(memoryStream);
                    var imageBytes = memoryStream.ToArray();

                    using (var engine = new TesseractEngine(@"./tessdata", "vie", EngineMode.Default))
                    {
                        using (var img = Pix.LoadFromMemory(imageBytes))
                        using (var page = engine.Process(img))
                        {
                            extractedText = page.GetText();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
               
                var baseException = ex.GetBaseException();
                _logger.LogError(ex, "Error Ocr");
                return StatusCode(500, $"Error OCR: {baseException.Message}");
            }

            var parser = new GplxParser(extractedText);
            var gplxData = parser.Parse();
            //------

            var licenseType = await _driverLicenseRepository.GetLicenseTypeByCodeAsync(gplxData.LicenseClass);

            if (licenseType == null)
            {
                return BadRequest(new { message = $"License class '{gplxData.LicenseClass}' is not supported." });
            }

            return Ok(new
            {
                message = "OCR  successful. Please review and confirm the information.",
                extractedData = gplxData,
                extractedText
            });
        }

        [Authorize]
        [HttpPost("confirm-license")]
        public async Task<IActionResult> ConfirmAndSaveLicense([FromBody] GplxData gplxData)
        {
            var userIdClaim = User.FindFirstValue("VroomVroomUserId");
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("Can not identify user from token..");
            }

            try
            {
                // Lưu dữ liệu vào database khi user confirm
                await _ocrService.ProcessGplxDataAsync(int.Parse(userIdClaim), gplxData);

                return Ok(new
                {
                    message = "Driver's license information has been successfully confirmed and saved..",
                    success = true
                });
            }
            catch (BadHttpRequestException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving driver's license information");
                return StatusCode(500, "Server error while saving information.");
            }
        }
    }
}
