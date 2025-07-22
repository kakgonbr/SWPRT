using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using rental_services.Server.Models;
using System.Security.Claims;

namespace rental_services.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class ImagesController : ControllerBase
    {
        private static readonly HashSet<ImageUploadTracker> _imageTrackers = new();
        private readonly ILogger<ImagesController> _logger;
        private readonly Services.IUserService _userService;

        public ImagesController(ILogger<ImagesController> logger, Services.IUserService userService)
        {
            _logger = logger;
            _userService = userService;
        }

        [Authorize(Roles = Utils.Config.Role.Admin)]
        [HttpPost("admin")]
        public async Task<IActionResult> AdminUpload([FromForm] IFormFile file)
        {
            string status = await Utils.ImageUploadHandler.Upload(file);

            if (status.StartsWith("Failed"))
            {
                return BadRequest(status);
            }

            var url = $"{Request.Scheme}://{Request.Host}/images/{status}";
            return Ok(new { message = "File uploaded.", url, name = status });
        }

        private class ImageUploadTracker
        {
            public DateTime UploadTime { get; init; }
            public bool IsExpired => UploadTime.AddMinutes(Utils.Config.Image.ExpireInMinutes) < Utils.CustomDateTime.CurrentTime;
            public int CustomerId { get; init; }
            public string ImageName { get; init; } = null!;
            public ImageUploadTracker()
            {
                UploadTime = Utils.CustomDateTime.CurrentTime;
            }

            public override bool Equals(object? obj)
            {
                if (obj is ImageUploadTracker other)
                    return CustomerId == other.CustomerId;

                return false;
            }

            public override int GetHashCode()
            {
                return CustomerId;
            }

            public override string ToString()
            {
                return $"Tracker: CID : {CustomerId}, IMG: {ImageName}";
            }
        }

        public async Task CleanupPendingAsync()
        {
            foreach (var tracker in _imageTrackers)
            {
                if (tracker.IsExpired)
                {
                    _logger.LogInformation("Clearing tracker for {BookingId}", tracker.BookingId);

                    await _bookingRepository.DeleteAsync(tracker.BookingId);
                    rentalTrackers.Remove(tracker);
                }
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Upload([FromForm] IFormFile file)
        {
            string? sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Models.User? dbUser = null;

            dbUser = await _userService.GetUserBySubAsync(sub));

            string status = await Utils.ImageUploadHandler.Upload(file);

            if (status.StartsWith("Failed"))
            {
                return BadRequest(status);
            }

            var url = $"{Request.Scheme}://{Request.Host}/images/{status}";
            return Ok(new { message = "File uploaded.", url, name = status });
        }
    }
}