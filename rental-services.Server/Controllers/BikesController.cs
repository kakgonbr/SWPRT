using Microsoft.AspNetCore.Mvc;
using rental_services.Server.Services;
using rental_services.Server.Models.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace rental_services.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BikesController : ControllerBase
{
    private readonly BikeService _bikeService;

    public BikesController(BikeService vehicleModelService)
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
