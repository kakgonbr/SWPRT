using Microsoft.AspNetCore.Mvc;
using rental_services.Server.Services;
using rental_services.Server.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using rental_services.Server.Models;
using System.Security.Claims;

namespace rental_services.Server.Controllers;

/// <summary>
/// For motorbike models, not individual physical bike
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BikesController : ControllerBase
{
    private readonly IBikeService _bikeService;
    private readonly IUserService _userService;

    public BikesController(IBikeService vehicleModelService, IUserService userService)
    {
        _bikeService = vehicleModelService;
        _userService = userService;
    }

    // GET /bikes
    [HttpGet]
    public async Task<ActionResult<List<VehicleModelDTO>>> GetAll()
    {
        var models = await _bikeService.GetModelListAsync();
        return Ok(models);
    }

    // GET /bikes/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<VehicleDetailsDTO>> GetById(int id)
    {
        var details = await _bikeService.GetVehicleDetails(id);
        if (details is null)
        {
            return NotFound();
        }

        return Ok(details);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Utils.Config.Role.Admin)]
    public async Task<ActionResult<string>> DeleteBIkeModel(int id)
    {
        return await _bikeService.DeleteVehicleModel(id) ? Ok("Deleted.") : BadRequest("Failed to delete.");
    }

    // GET /bikes/available?startDate=2024-06-01&endDate=2024-06-10&address=abc&searchTerm=honda
    [HttpGet("available")]
    [AllowAnonymous]
    [Authorize]
    public async Task<ActionResult<List<VehicleModelDTO>>> GetAvailable(DateOnly? startDate, DateOnly? endDate, string? address = null, string? searchTerm = null)
    {
        string? sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        User? dbUser = null;
        int? userId = null;

        if (sub is not null && (dbUser = await _userService.GetUserBySubAsync(sub)) is not null)
        {
            userId = dbUser.UserId;
        }

        try
        {
            var availableModels = await _bikeService.GetAvailableModelsAsync(userId, startDate, endDate, address, searchTerm);
            if (availableModels == null)
                return NotFound("No available models found for the given date range and address.");
            return Ok(availableModels);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // PATCH /bikes
    [HttpPatch]
    [Authorize(Roles = Utils.Config.Role.Admin)]
    public async Task<ActionResult<string>> EditVehicleModel([FromBody] VehicleDetailsDTO vehicleDetails)
    {
        bool result = await _bikeService.UpdateVehicleModelAsync(vehicleDetails);

        return result ? Ok("Updated.") : BadRequest("Failed to update.");
    }

    // PUT /bikes
    [HttpPut]
    [Authorize(Roles = Utils.Config.Role.Admin)]
    public async Task<ActionResult<string>> AddVehicleModel([FromBody] VehicleDetailsDTO vehicleDetails)
    {
        bool result = await _bikeService.AddVehicleModel(vehicleDetails);

        return Ok(result ? "Added." : "Failed to add.");
    }

    [HttpGet("physical/{modelId}")]
    [Authorize(Roles = Utils.Config.Role.Admin)]
    public async Task<ActionResult<List<VehicleDTO>>> GetPhysicalVehicles(int modelId)
    {
        var physicalVehicles = await _bikeService.GetDTOOfModelAsync(modelId);

        return physicalVehicles.IsNullOrEmpty() ? NotFound($"No physical vehicle of {modelId}.") : Ok(physicalVehicles); 
    }

    [HttpPatch("physical")]
    [Authorize(Roles = Utils.Config.Role.Admin)]
    public async Task<ActionResult<string>> EditPhysicalVehicle([FromBody] VehicleDTO vehicle)
    {
        return await _bikeService.UpdatePhysicalAsync(vehicle) ? Ok("Updated.") : BadRequest("Failed.");
    }

    [HttpPut("physical/{modelId}")] 
    [Authorize(Roles = Utils.Config.Role.Admin)]
    public async Task<ActionResult<string>> AddPhysicalVehicle(int modelId, [FromBody] VehicleDTO vehicle)
    {
        return await _bikeService.AddPhysicalAsync(modelId, vehicle) ? Ok("Added.") : BadRequest("Failed.");
    }

    [HttpDelete("physical/{id}")]
    [Authorize(Roles = Utils.Config.Role.Admin)]
    public async Task<ActionResult<string>> DeletePhysicalVehicle(int id)
    {
        return await _bikeService.DeletePhysicalAsync(id) ? Ok("Deleted.") : BadRequest("Failed.");
    }

    // GET /bikes/filter/type
    [HttpGet("filter/type")]
    public ActionResult<List<VehicleModelDTO>> FilterByVehicleType(List<VehicleModelDTO> vehicleModels, string? type)
    {
        return Ok(_bikeService.FilterModelByVehicleType(vehicleModels, type));
    }

    // GET /bikes/filter/shop
    [HttpGet("filter/shop")]
    public ActionResult<List<VehicleModelDTO>> FilterByShop(List<VehicleModelDTO> vehicleModels, string? shop)
    {
        return Ok(_bikeService.FilterModelByShop(vehicleModels, shop));
    }

    [HttpGet("shops")]
    [AllowAnonymous]
    [Authorize(Roles = Utils.Config.Role.Admin)]
    public async Task<ActionResult<List<ShopDTO>>> GetAllShopsAsync()
    {
        return Ok(await _bikeService.GetAllShopsAsync());
    }

    [HttpGet("types")]
    [Authorize(Roles = Utils.Config.Role.Admin)]
    public async Task<ActionResult<List<VehicleTypeDTO>>> GetAllVehicleTypesAsync()
    {
        return Ok(await _bikeService.GetAllVehicleTypesAsync());
    }

    [HttpGet("manufacturers")]
    [Authorize(Roles = Utils.Config.Role.Admin)]
    public async Task<ActionResult<List<ManufacturerDTO>>> GetAllManufacturersAsync()
    {
        return Ok(await _bikeService.GetAllManufacturersAsync());
    }

    [HttpGet("peripherals")]
    [Authorize(Roles = Utils.Config.Role.Admin)]
    public async Task<ActionResult<List<PeripheralDTO>>> GetAllPeripheralsAsync()
    {
        return Ok(await _bikeService.GetAllPeripheralsAsync());
    }
}
