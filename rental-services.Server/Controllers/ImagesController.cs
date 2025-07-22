using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace rental_services.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize(Roles = Utils.Config.Role.Admin)]
    [Authorize]
    public class ImagesController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Upload([FromForm] IFormFile file)
        {
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