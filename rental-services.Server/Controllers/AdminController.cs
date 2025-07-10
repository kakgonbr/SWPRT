using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Services;
using System.Text;

namespace rental_services.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Utils.Config.Role.Admin)]
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
        public async Task<ActionResult<ServerStatisticsDTO>> GetStatisticsAsync()
        {
            return Ok(await _adminService.GetStatisticsAsync());
        }

        [HttpGet("banners")]
        public async Task<ActionResult<List<BannerDTO>>> GetAllBannersAsync()
        {
            return Ok(await _adminService.GetAllbannersAsync());
        }

        [HttpPut("banners")]
        public async Task<ActionResult<BannerDTO>> AddBannerAsync([FromBody] BannerDTO newBanner)
        {
            return await _adminService.AddBannerAsync(newBanner) ? Ok(newBanner) : BadRequest("Failed.");
        }

        [HttpDelete("banners/{id}")]
        public async Task<ActionResult<string>> DeleteBannerAsync(int id)
        {
            return await _adminService.DeleteBannerAsync(id) ? Ok("Deleted.") : BadRequest("Failed.");
        }

        [HttpPatch("banners")]
        public async Task<ActionResult<BannerDTO>> UpdateBannerAsync([FromBody] BannerDTO banner)
        {
            return await _adminService.EditBannerAsync(banner) ? Ok(banner) : BadRequest("Failed.");
        }

        [HttpPatch("banners/{id}")]
        public async Task<ActionResult<BannerDTO>> ToggleBannerStatusAsync(int id)
        {
            return await _adminService.ToggleBannerStatusAsync(id) ? Ok("Updated.") : BadRequest("Failed.");
        }

        [HttpPost("maintenance")]
        public ActionResult<string> EnableMaintenance([FromBody] MaintenanceDTO maintenance)
        {
            return _maintenanceService.SetMaintenancePeriod(maintenance.Start ?? Utils.CustomDateTime.CurrentTime, maintenance.End ?? DateTime.MaxValue, maintenance.Message) ? Ok("Set.") : BadRequest("Failed.");
        }

        [HttpDelete("maintenance")]
        public ActionResult<string> ClearMaintenance()
        {
            _maintenanceService.ClearMaintenancePeriod();

            return _maintenanceService.IsActive ? BadRequest("Failed.") : Ok("Cleared.");
        }

        [HttpGet("settings")]
        public ActionResult<SystemSettingsDTO> GetSettings()
        {
            return Ok(_systemSettingsService.SystemSettings);
        }

        [HttpPost("settings")]
        public ActionResult<SystemSettingsDTO> UpdateSettings([FromBody] SystemSettingsDTO systemSettings)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _systemSettingsService.SystemSettings = systemSettings;

            return Ok(_systemSettingsService.SystemSettings);
        }

        [HttpGet("csv/{days?}")]
        public async Task<FileContentResult> GetCSVReports(int? days)
        {
            List<ServerStatisticsDTO> statistics = await _adminService.GetOfDurationAsync(days);

            var csv = new StringBuilder()
                .AppendLine("day,users,rentals,revenue");

            for (int d = 0; d < statistics.Count; ++d)
            {
                csv.AppendLine(string.Join(",", DateOnly.FromDateTime(DateTime.Now).AddDays(-d), statistics[d].TotalUsers, statistics[d].ActiveRentals, statistics[d].MonthlyRevenue));
            }

            var bytes = Encoding.UTF8.GetBytes(csv.ToString());

            return File(bytes, "text/csv", "report.csv");
        }

        [HttpGet("pay")]
        public string? GetPaymentLink()
        {
            // first ip in the chain
            //var forwardedHeader = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            //string? ip = forwardedHeader?.Split(',').FirstOrDefault()?.Trim();

            // now using proxy_set_header X-Forwarded-For $remote_addr;
            // there is only 1 ip after nginx stripped
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

            return ip is null ? null :  VNPayService.GetLink(ip, null, 10_000 * 100, "vn", Utils.Config.VnpConfig.GetRandomNumber(10));
        }
    }
}
