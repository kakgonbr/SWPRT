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
        private readonly IAdminControlPanelService _bannerService;
        private readonly IMaintenanceService _maintenanceService;

        public AdminController(IAdminControlPanelService bannerService, IMaintenanceService maintenanceService)
        {
            _bannerService = bannerService;
            _maintenanceService = maintenanceService;
        }

        [HttpGet("banners")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public async Task<ActionResult<List<BannerDTO>>> GetAllBannersAsync()
        {
            return Ok(await _bannerService.GetAllbannersAsync());
        }

        [HttpPut("banners")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public async Task<ActionResult<string>> AddBannerAsync([FromBody] BannerDTO newBanner)
        {
            return await _bannerService.AddBannerAsync(newBanner) ? Ok("Added.") : BadRequest("Failed.");
        }

        [HttpDelete("banners/{id}")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public async Task<ActionResult<string>> DeleteBannerAsync(int id)
        {
            return await _bannerService.DeleteBannerAsync(id) ? Ok("Deleted.") : BadRequest("Failed.");
        }

        [HttpPatch("banners")]
        [Authorize(Roles = Utils.Config.Role.Admin)]
        public async Task<ActionResult<string>> UpdateBannerAsync([FromBody] BannerDTO banner)
        {
            return await _bannerService.EditBannerAsync(banner) ? Ok("Updated.") : BadRequest("Failed.");
        }

        [HttpPost("maintenance")]
        public ActionResult<string> EnableMaintenance([FromBody] MaintenanceDTO maintenance)
        {
            return _maintenanceService.SetMaintenancePeriod(maintenance.Start ?? Utils.CustomDateTime.CurrentTime, maintenance.End ?? DateTime.MaxValue, maintenance.Message) ? Ok("Set.") : BadRequest("Failed");
        }

        [HttpDelete("maintenance")]
        public ActionResult<string> ClearMaintenance()
        {
            _maintenanceService.ClearMaintenancePeriod();

            return _maintenanceService.IsActive ? BadRequest("Failed.") : Ok("Cleared.");
        }
    }
}
