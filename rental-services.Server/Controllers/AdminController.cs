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
        private readonly ISystemSettingsService _systemSettingsService;

        public AdminController(IAdminControlPanelService bannerService, IMaintenanceService maintenanceService, ISystemSettingsService systemSettingsService)
        {
            _adminService = bannerService;
            _maintenanceService = maintenanceService;
            _systemSettingsService = systemSettingsService;
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
        public async Task<ActionResult<BannerDTO>> AddBannerAsync([FromBody] BannerDTO newBanner)
        {
            return await _adminService.AddBannerAsync(newBanner) ? Ok(newBanner) : BadRequest("Failed.");
        }

        [HttpDelete("banners/{id}")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public async Task<ActionResult<string>> DeleteBannerAsync(int id)
        {
            return await _adminService.DeleteBannerAsync(id) ? Ok("Deleted.") : BadRequest("Failed.");
        }

        [HttpPatch("banners")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public async Task<ActionResult<BannerDTO>> UpdateBannerAsync([FromBody] BannerDTO banner)
        {
            return await _adminService.EditBannerAsync(banner) ? Ok(banner) : BadRequest("Failed.");
        }

        [HttpPatch("banners/{id}")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public async Task<ActionResult<BannerDTO>> ToggleBannerStatusAsync(int id)
        {
            return await _adminService.ToggleBannerStatusAsync(id) ? Ok("Updated.") : BadRequest("Failed.");
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

        [HttpGet("settings")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public ActionResult<SystemSettingsDTO> GetSettings()
        {
            return Ok(_systemSettingsService.SystemSettings);
        }

        [HttpPost("settings")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public ActionResult<SystemSettingsDTO> UpdateSettings([FromBody] SystemSettingsDTO systemSettings)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _systemSettingsService.SystemSettings = systemSettings;

            return Ok(_systemSettingsService.SystemSettings);
        }
    }
}
