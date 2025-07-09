using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using rental_services.Server.Models.DTOs;
using System.Security.Claims;

namespace rental_services.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public partial class RentalsController : ControllerBase
    {
        private readonly Services.IRentalService _rentalService;
        private readonly Services.IUserService _userService;
        private readonly ILogger<RentalsController> _logger;

        public RentalsController(ILogger<RentalsController> logger, Services.IRentalService rentalService, Services.IUserService userService)
        {
            _rentalService = rentalService;
            _userService = userService;
            _logger = logger;
        }

        // GET /rentals
        [HttpGet]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<List<Models.DTOs.BookingDTO>>> GetAll()
        {
            return await _rentalService.GetAllBookingsAsync();
        }

        // POST /rentals/book
        [HttpPost("book")]
        [Authorize]
        public async Task<ActionResult<string>> CreateBooking([FromBody] Models.DTOs.BookingDTO bookingDTO)
        {
            try
            {
                string? sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
                Models.User? dbUser = await _userService.GetUserBySubAsync(sub);

                if (dbUser == null)
                {
                    return Unauthorized();
                }

                bookingDTO.CustomerId = dbUser.UserId;
                if (bookingDTO.StartDate >= bookingDTO.EndDate)
                {
                    return BadRequest("Start date is before the end date");
                }

                bool result = await _rentalService.AddBookingAsync(bookingDTO);
                if (result)
                {
                    return Ok("Booking is successfully created");
                } else
                {
                    return BadRequest("Booking is failed to create, please check for overlap date");
                }
            } catch (Exception ex)
            {
                _logger.LogError(ex, "booking create error");
                return StatusCode(500, "Internal Error");
            }
        }

        // GET /rentals/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<List<Models.DTOs.BookingDTO>>> GetByUser(int id)
        {
            string? sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Models.User? dbUser = null;

            if (sub is null || (dbUser = await _userService.GetUserBySubAsync(sub)) is null || dbUser.UserId != id)
            {
                return Unauthorized();
            }

            return await _rentalService.GetOfUserAsync(dbUser.UserId);
        }

        // POST /rentals
        [HttpPost]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<ActionResult<string>> UpdateRentalStatus([FromBody] Models.DTOs.BookingStatusDTO rentalStatus)
        {
            return await _rentalService.UpdateStatusAsync(rentalStatus.Id, rentalStatus.Status) ? Ok("Updated.") : BadRequest("Failed.");
        }
    }
}
