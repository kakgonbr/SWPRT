using System.IdentityModel.Tokens.Jwt;
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
            if (newUser.UserId == 1)
            {
                return BadRequest("Cannot edit root user.");
            }

            return await _userService.UpdateUser(newUser) ? Ok("Updated.") : BadRequest("Failed.");
        }
        
        [HttpPost("change-password")]
        [Authorize]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                // Get sub from JWT token
                var sub = JwtRegisteredClaimNames.Sub;
                var user = _userService.GetUserBySubAsync(JwtRegisteredClaimNames.Sub)!;
                if (user == null)
                {
                    return Unauthorized("Invalid user token");
                }

                var result = await _userService.ChangePasswordAsync(sub, request.CurrentPassword, request.NewPassword);
        
                if (!result.Success)
                {
                    return BadRequest(new { message = result.ErrorMessage });
                }

                return Ok(new { message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while changing password" });
            }
        }
    }
}
