using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using rental_services.Server.Models;
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
                var sub = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
                if (sub == null)
                {
                    return Unauthorized("Invalid user token");
                }
                var user = await _userService.GetUserBySubAsync(sub.Value);
                if (user == null)
                {
                    return Unauthorized("User not found");
                }

                var result = await _userService.ChangePasswordAsync(sub.Value, request.CurrentPassword, request.NewPassword);
        
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

        [HttpGet("licenses")]
        [Authorize]
        public async Task<ActionResult<List<DriverLicenseDto>>> GetOwnLicenses()
        {
            string? sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
            User? dbUser = null;

            if (sub is null || (dbUser = await _userService.GetUserBySubAsync(sub)) is null)
            {
                return Unauthorized();
            }

            return Ok(await _userService.GetOwnLicenses(dbUser.UserId));
        }

        [HttpDelete("licenses/{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteLicense(string id)
        {
            string? sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
            User? dbUser = null;

            if (sub is null || (dbUser = await _userService.GetUserBySubAsync(sub)) is null)
            {
                return Unauthorized();
            }

            return await _userService.DeleteLicense(dbUser.UserId, id) ? Ok() : BadRequest();
        }
    }
}
