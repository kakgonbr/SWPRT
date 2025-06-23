using Microsoft.AspNetCore.Mvc;
using rental_services.Server.Services;
using rental_services.Server.Models.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace rental_services.Server.Controllers;

/// <summary>
/// For individual physical bike, only list view is available
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PhysicalBikesController : ControllerBase
{
    private readonly BikeService _bikeService;

    public PhysicalBikesController(BikeService vehicleModelService)
    {
        _bikeService = vehicleModelService;
    }

    // GET /physicalBikes/modelId
    [HttpGet("{modelId}")]
    public async Task<ActionResult<List<VehicleDTO>>> GetOfModel(int modelId)
    {
        List<VehicleDTO> physicalBikes = await _bikeService.GetDTOOfModelAsync(modelId);
        return Ok(physicalBikes);
    }

    // update individual
    [HttpPost]
    public async Task<ActionResult<string>> UpdatePhysicalBike([FromBody] VehicleDTO vehicle)
    {
        return await _bikeService.UpdatePhysicalAsync(vehicle) ? Ok("Updated") : Ok("Failed to update");
    }
}
