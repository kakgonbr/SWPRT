using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
            return await _rentalService.GetAllBookingsAsync();}

        
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

        // GET /rentals/pay
        [HttpGet("pay")]
        [Authorize]
        // TODO: ADD FROMBODY json
        public async Task<ActionResult<string?>> SubmitAndGetPaymentLink()
        {
            string? sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Models.User? dbUser = null;

            if (sub is null || (dbUser = await _userService.GetUserBySubAsync(sub)) is null)
            {
                return Unauthorized();
            }

            string? ip = HttpContext.Connection.RemoteIpAddress?
                .MapToIPv4()
                .ToString();

            if (ip is null)
            {
                return BadRequest();
            }

            if (!await _rentalService.CreateRentalAsync(dbUser.UserId, 1, DateOnly.FromDateTime(DateTime.Now).AddDays(3), DateOnly.FromDateTime(DateTime.Now).AddDays(30)))
            {
                return BadRequest();
            }

            return await _rentalService.GetPaymentLinkAsync(dbUser.UserId, ip);
        }
    }
}
