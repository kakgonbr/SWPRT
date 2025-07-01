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
            string status = await ImageUploadHandler.Upload(image);

            if (status.StartsWith("Failed"))
            {
                return BadRequest(status);
            }

            var imageUrl = $"{Request.Scheme}://{Request.Host}/images/{status}";

            string extractedText;
            try
            {
                // Đọc ảnh vào memory stream thay vì lưu file
                using (var memoryStream = new MemoryStream())
                {
                    await image.CopyToAsync(memoryStream);
                    var imageBytes = memoryStream.ToArray();

                    _logger.LogInformation("CWD: {Directory}", Directory.GetCurrentDirectory());
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
                _logger.LogError(ex, "Lỗi nghiêm trọng trong quá trình xử lý OCR");
                return StatusCode(500, $"Lỗi OCR: {ex.Message}");
            }

            var parser = new GplxParser(extractedText);
            var gplxData = parser.Parse();
            gplxData.ImageUrl = imageUrl;

            // Chỉ trả về dữ liệu đã extract, không lưu database
            return Ok(new
            {
                message = "Xử lý OCR thành công. Vui lòng xem xét và xác nhận thông tin.",
                extractedData = gplxData,
                imageUrl = imageUrl
            });
        }

        [Authorize]
        [HttpPost("confirm-license")]
        public async Task<IActionResult> ConfirmAndSaveLicense([FromBody] GplxData gplxData)
        {
            var userSub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (string.IsNullOrEmpty(userSub))
            {
                return Unauthorized("Không thể xác định người dùng từ token.");
            }

            try
            {
                // Lưu dữ liệu vào database khi user confirm
                await _ocrService.ProcessGplxDataAsync(userSub, gplxData, gplxData.ImageUrl ?? "");
                
                return Ok(new
                {
                    message = "Thông tin bằng lái đã được xác nhận và lưu thành công.",
                    success = true
                });
            }
            catch (BadHttpRequestException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu thông tin bằng lái");
                return StatusCode(500, "Lỗi server khi lưu thông tin.");
            }
        }

        /// <summary>
        /// UNUSED
        /// </summary>
        /// <param name="image"></param>
        /// <returns></returns>
        /// <exception cref="InvalidOperationException"></exception>
        /// <exception cref="Exception"></exception>
        private async Task<string> UploadImageToServer(IFormFile image)
{
    try
    {
        var client = new HttpClient();
        string imgbbApiKey = Environment.GetEnvironmentVariable("IMGBB_API_KEY") ?? throw new InvalidOperationException("Environment Variable 'IMGBB_API_KEY' not found.");
        string requestUrl = "https://api.imgbb.com/1/upload?key=" + imgbbApiKey; 
        var request = new HttpRequestMessage(HttpMethod.Post, requestUrl);
        var streamContent = new StreamContent(image.OpenReadStream());
        streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(image.ContentType);
        request.Content = new MultipartFormDataContent();
        ((MultipartFormDataContent)request.Content).Add(streamContent, "image", image.FileName);
        var response = await client.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();

        var jsonResponse = JsonDocument.Parse(responseBody);
        if (!jsonResponse.RootElement.TryGetProperty("data", out var data) ||
            !data.TryGetProperty("image", out var imageObj) ||
            !imageObj.TryGetProperty("url", out var urlProp))
        {
            throw new Exception("Không lấy được URL ảnh từ imgbb.");
        }
        return urlProp.GetString();
    }
    catch (Exception ex)
    {
        // Log lỗi nếu cần
        throw new Exception("Lỗi khi upload ảnh lên imgbb: " + ex.Message, ex);
    }
}
    }
} 
