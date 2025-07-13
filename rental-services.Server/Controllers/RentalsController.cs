using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Services;
using System.Security.Claims;

namespace rental_services.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public partial class RentalsController : ControllerBase
    {
        
        private readonly Services.IRentalService _rentalService;
        private readonly Services.IUserService _userService;
        private readonly Services.IBikeService _bikeService;
        private readonly ILogger<RentalsController> _logger;

        public RentalsController(ILogger<RentalsController> logger, Services.IRentalService rentalService,
            Services.IUserService userService, Services.IBikeService bikeService)
        {
            _rentalService = rentalService;
            _userService = userService;
            _bikeService = bikeService;
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
        //[HttpPost("book")]
        //[Authorize]
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

                // Validate booking data
                if (bookingDTO.VehicleModelId <= 0)
                {
                    return BadRequest("Valid vehicle model ID is required");
                }

                if (string.IsNullOrEmpty(bookingDTO.BikeName))
                {
                    return BadRequest("Bike name is required");
                }

                if (string.IsNullOrEmpty(bookingDTO.CustomerName))
                {
                    return BadRequest("Customer name is required");
                }

                if (string.IsNullOrEmpty(bookingDTO.CustomerEmail))
                {
                    return BadRequest("Customer email is required");
                }

                bookingDTO.CustomerId = dbUser.UserId;
                if (bookingDTO.StartDate >= bookingDTO.EndDate)
                {
                    return BadRequest("Start date is before the end date");
                }

                if (!bookingDTO.BikeId.HasValue && bookingDTO.VehicleModelId > 0)
                {
                    var assignedVehicleId = await _bikeService.AssignAvailableVehicleAsync(bookingDTO.VehicleModelId,
                        bookingDTO.StartDate, bookingDTO.EndDate, bookingDTO.PickupLocation);
                    if (!assignedVehicleId.HasValue)
                    {
                        return BadRequest("No available vehicle left for this model");
                    }
                    bookingDTO.BikeId = assignedVehicleId;
                }

                bool result = await _rentalService.AddBookingAsync(bookingDTO);
                if (result)
                {
                    return Ok("Booking is successfully created");
                }
                else
                {
                    return BadRequest("Booking is failed to create, error with AddBookingAsync");
                }
            }
            catch (Exception ex)
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
            return await _rentalService.UpdateStatusAsync(rentalStatus.Id, rentalStatus.Status)
                ? Ok("Updated.")
                : BadRequest("Failed.");
        }

        // POST /rentals/book
        [HttpPost("book")]
        [Authorize]
        public async Task<ActionResult<string?>> SubmitBookingInfo([FromBody] Models.DTOs.BookingDTO? bookingDTO)
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

            if (ip is null || bookingDTO is null)
            {
                return BadRequest("IP or body not found.");
            }

            if (await _rentalService.CreateRentalAsync(dbUser.UserId, bookingDTO.VehicleModelId,
                        bookingDTO.StartDate, bookingDTO.EndDate, bookingDTO.PickupLocation) == RentalService.CreateRentalResult.CREATE_FAILURE)
            {
                return BadRequest("Rental creation failed.");
            }

            return Ok(await _rentalService.GetPaymentLinkAsync(dbUser.UserId, ip));
        }

        // GET /rentals/pay
        [HttpGet("pay")]
        [Authorize]
        public async Task<ActionResult<string?>> GetPaymentLink()
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
                return BadRequest("IP address unavailable.");
            }

            string? link = await _rentalService.GetPaymentLinkAsync(dbUser.UserId, ip);

            return link is null ? BadRequest("Payment link generation failed.") : Ok(link);
        }

        // GET /rentals/cancel/{bookingId}
        [HttpGet("cancel/{bookingId}")]
        [Authorize]
        public async Task<ActionResult<string?>> GetPaymentLink(int bookingId)
        {
            string? sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Models.User? dbUser = null;

            if (sub is null || (dbUser = await _userService.GetUserBySubAsync(sub)) is null)
            {
                return Unauthorized();
            }

            return await _rentalService.HandleCancelAndRefundAsync(dbUser.UserId, bookingId) ? Ok() : BadRequest();
        }
    }
}
