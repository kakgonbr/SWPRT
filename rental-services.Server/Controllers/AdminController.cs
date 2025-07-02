using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Services;

namespace rental_services.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : Controller
    {
        private readonly IAdminControlPanelService _adminService;
        private readonly IMaintenanceService _maintenanceService;

        public AdminController(IAdminControlPanelService bannerService, IMaintenanceService maintenanceService)
        {
            _adminService = bannerService;
            _maintenanceService = maintenanceService;
        }

        [HttpGet("stats")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public async Task<ActionResult<ServerStatisticsDTO>> GetStatisticsAsync()
        {
            return Ok(await _adminService.GetStatisticsAsync());
        }

        [HttpGet("banners")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public async Task<ActionResult<List<BannerDTO>>> GetAllBannersAsync()
        {
            return Ok(await _adminService.GetAllbannersAsync());
        }

        [HttpPut("banners")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public async Task<ActionResult<string>> AddBannerAsync([FromBody] BannerDTO newBanner)
        {
            return await _adminService.AddBannerAsync(newBanner) ? Ok("Added.") : BadRequest("Failed.");
        }

        [HttpDelete("banners/{id}")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public async Task<ActionResult<string>> DeleteBannerAsync(int id)
        {
            return await _adminService.DeleteBannerAsync(id) ? Ok("Deleted.") : BadRequest("Failed.");
        }

        [HttpPatch("banners")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public async Task<ActionResult<string>> UpdateBannerAsync([FromBody] BannerDTO banner)
        {
            return await _adminService.EditBannerAsync(banner) ? Ok("Updated.") : BadRequest("Failed.");
        }

        [HttpPost("maintenance")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public ActionResult<string> EnableMaintenance([FromBody] MaintenanceDTO maintenance)
        {
            return _maintenanceService.SetMaintenancePeriod(maintenance.Start ?? Utils.CustomDateTime.CurrentTime, maintenance.End ?? DateTime.MaxValue, maintenance.Message) ? Ok("Set.") : BadRequest("Failed.");
        }

        [HttpDelete("maintenance")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public ActionResult<string> ClearMaintenance()
        {
            _maintenanceService.ClearMaintenancePeriod();

            return _maintenanceService.IsActive ? BadRequest("Failed.") : Ok("Cleared.");
        }
    }
}
