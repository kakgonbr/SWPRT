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
                // _logger.LogError(ex, "Lỗi nghiêm trọng trong quá trình xử lý OCR");
                // return StatusCode(500, $"Lỗi OCR: {ex.Message}");
                var baseException = ex.GetBaseException();
    _logger.LogError(ex, "Lỗi nghiêm trọng trong quá trình xử lý OCR");
    return StatusCode(500, $"Lỗi OCR: {baseException.Message}");
            }

            var parser = new GplxParser(extractedText);
            var gplxData = parser.Parse();

            return Ok(new
            {
                message = "Xử lý OCR thành công. Vui lòng xem xét và xác nhận thông tin.",
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
                return Unauthorized("Không thể xác định người dùng từ token.");
            }

            try
            {
                // Lưu dữ liệu vào database khi user confirm
                await _ocrService.ProcessGplxDataAsync(int.Parse(userIdClaim), gplxData);
                
                return Ok(new
                {
                    message = "Thông tin bằng lái đã được xác nhận và lưu thành công.",
                    success = true
                });
            }
            catch (BadHttpRequestException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu thông tin bằng lái");
                return StatusCode(500, "Lỗi server khi lưu thông tin.");
            }
        }
    }
} 
