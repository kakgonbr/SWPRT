using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace rental_services.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MotorbikeController : ControllerBase
{
    /// <summary>
    /// For admin: get all motorbikes
    /// </summary>
    [HttpGet("bikes/get")]
    [Authorize(Roles = Utils.Config.Role.Admin)]
    public IActionResult GetBikes()
    {
        return Ok(new {Message = "Bikes"});
    }
    /// <summary>
    /// For admin: add a new motorbike
    /// </summary>
    [HttpGet("bikes/add")]
    [Authorize(Roles = Utils.Config.Role.Admin)]
    public IActionResult AddBike()
    {
        return Ok(new {Message = "Add a Bike"});
    }
}