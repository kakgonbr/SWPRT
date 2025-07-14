using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Services;
using System.Security.Claims;

namespace rental_services.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _service;
        public FeedbackController(IFeedbackService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> SubmitFeedback([FromForm] FeedbackFormDto feedbackForm)
        {
            var userIdClaim = User.FindFirstValue("VroomVroomUserId");
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var feedbackDto = new FeedbackDTO
            {
                UserId = int.Parse(userIdClaim),
                Title = feedbackForm.Title,
                Body = feedbackForm.Body
            };

            var result = await _service.SubmitFeedbackAsync(
                feedbackDto,
                feedbackForm.Screenshot,
                Request.Scheme,
                Request.Host.Value
            );

            return Ok(new { message = "Feedback submitted successfully.", feedback = result });
        }
    }

    // Dùng riêng cho nhận form-data từ FE
    public class FeedbackFormDto
    {
        public string Title { get; set; } = null!;
        public string Body { get; set; } = null!;
        public IFormFile? Screenshot { get; set; }
    }
} 