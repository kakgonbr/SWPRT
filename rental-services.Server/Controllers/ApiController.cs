using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace rental_services.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApiController : Controller
{
    [HttpGet]
    [Authorize]
    public IActionResult Get()
    {
        var userId = User.FindFirst("sub")?.Value;
        return Ok(new
        {
            Message = "Hello from a private endpoint!",
            UserId = userId
        });
    }

    [HttpGet("public")]
    public IActionResult Public()
    {
        return Ok(new
        {
            Message = "Hello from a open endpoint!"
        });
    }
}