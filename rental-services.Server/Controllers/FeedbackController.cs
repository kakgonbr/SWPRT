using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using rental_services.Server.Data;
using rental_services.Server.Models;
using System.Security.Claims;

namespace rental_services.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly RentalContext _context;
        public FeedbackController(RentalContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> SubmitFeedback([FromForm] FeedbackDto feedbackDto)
        {
            var userIdClaim = User.FindFirstValue("VroomVroomUserId");
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var feedback = new Feedback
            {
                UserId = int.Parse(userIdClaim),
                Title = feedbackDto.Title,
                Body = feedbackDto.Body,
                ImagePath = null
            };

            if (feedbackDto.Screenshot != null && feedbackDto.Screenshot.Length > 0)
            {
                var imagesDir = System.IO.Path.Combine("wwwroot", "images");
                if (!System.IO.Directory.Exists(imagesDir))
                {
                    System.IO.Directory.CreateDirectory(imagesDir);
                }
                var fileName = $"{DateTime.Now:yyyyMMddHHmmssfff}_{Guid.NewGuid()}{System.IO.Path.GetExtension(feedbackDto.Screenshot.FileName)}";
                var savePath = System.IO.Path.Combine(imagesDir, fileName);
                using (var stream = new FileStream(savePath, FileMode.Create))
                {
                    await feedbackDto.Screenshot.CopyToAsync(stream);
                }
                var imageUrl = $"{Request.Scheme}://{Request.Host}/images/{fileName}";
                feedback.ImagePath = imageUrl;
            }

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Feedback submitted successfully." });
        }
    }

    public class FeedbackDto
    {
        public string Title { get; set; } = null!;
        public string Body { get; set; } = null!;
        public IFormFile? Screenshot { get; set; }
    }
} 