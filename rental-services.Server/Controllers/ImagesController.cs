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
        private readonly ILogger<ImagesController> _logger;
        private readonly Services.IUserService _userService;
        private readonly Services.IImageService _imageService;

        public ImagesController(ILogger<ImagesController> logger, Services.IUserService userService, Services.IImageService imageService)
        {
            _logger = logger;
            _userService = userService;
            _imageService = imageService;
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

        /// <summary>
        /// For customer image uploading.<br></br>
        /// An uploaded image will be tracked and be deleted after 3 minutes.<br></br>
        /// Call the consume method of the image service object to persist the image.
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Upload([FromForm] IFormFile file)
        {
            string? sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
            User? dbUser = null;

            if (sub is null || (dbUser = await _userService.GetUserBySubAsync(sub)) is null)
            {
                return Unauthorized();
            }

            string status = await Utils.ImageUploadHandler.Upload(file);

            if (status.StartsWith("Failed"))
            {
                return BadRequest(status);
            }

            _imageService.CheckImagePresent(status, dbUser.UserId);

            var url = $"{Request.Scheme}://{Request.Host}/images/{status}";
            return Ok(new { message = "File uploaded.", url, name = status });
        }
    }
}