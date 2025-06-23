using Microsoft.AspNetCore.Mvc;
using rental_services.Server.Services;
using rental_services.Server.Models.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace rental_services.Server.Controllers;

/// <summary>
/// For motorbike models, not individual physical bike
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BikesController : ControllerBase
{
    private readonly IBikeService _bikeService;

    public BikesController(IBikeService vehicleModelService)
    {
        _bikeService = vehicleModelService;
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

    // GET /vehicles/available?startDate=2024-06-01&endDate=2024-06-10&address=abc
    [HttpGet("available")]
    public async Task<ActionResult<List<VehicleModelDTO>>> GetAvailable(DateOnly startDate, DateOnly endDate, string? address = null)
    {
        var availableModels = await _bikeService.GetAvailableModelsAsync(startDate, endDate, address);
        return Ok(availableModels);
    }

    // POST /bikes/{id}
    [HttpPost("{id}")]
    [Authorize(Roles = Utils.Config.Role.Admin)]
    public async Task<ActionResult<string>> EditVehicleModel([FromBody] VehicleDetailsDTO vehicleDetails)
    {
        bool result = await _bikeService.UpdateVehicleModelAsync(vehicleDetails);

        return Ok(result ? "Updated." : "Failed to update.");
    }

    // POST /bikes
    [HttpPost]
    [Authorize(Roles = Utils.Config.Role.Admin)]
    public async Task<ActionResult<string>> AddVehicleModel([FromBody] VehicleDetailsDTO vehicleDetails)
    {
        bool result = await _bikeService.UpdateVehicleModelAsync(vehicleDetails);

        return Ok(result ? "Added." : "Failed to add.");
    }
}
