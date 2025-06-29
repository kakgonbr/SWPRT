using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Services;

namespace rental_services.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public async Task<ActionResult<List<UserDto>>> GetAll()
        {
            return Ok(await _userService.GetAll());
        }

        [HttpGet("{id}")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public async Task<ActionResult<UserDto>> GetById(int id)
        {
            return Ok(await _userService.GetUser(id));
        }

        [HttpPatch]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public async Task<ActionResult<string>> Update(UserDto newUser)
        {
            return await _userService.UpdateUser(newUser) ? Ok("Updated.") : BadRequest("Failed.");
        }
    }
}
