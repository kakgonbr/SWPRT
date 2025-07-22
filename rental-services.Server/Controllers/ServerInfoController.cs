using Microsoft.AspNetCore.Mvc;
using rental_services.Server.Services;

namespace rental_services.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServerInfoController : ControllerBase
    {
        private readonly IAdminControlPanelService _bannerService;
        private readonly IMaintenanceService _maintenanceService;
        private readonly ISystemSettingsService _systemSettingsService;

        public ServerInfoController(IAdminControlPanelService bannerService, IMaintenanceService maintenanceService, ISystemSettingsService systemSettingsService)
        {
            _bannerService = bannerService;
            _maintenanceService = maintenanceService;
            _systemSettingsService = systemSettingsService;
        }

        [HttpGet("banners")]
        public async Task<ActionResult<Models.DTOs.BannerDTO?>> GetTopBanner()
        {
            return Ok(await _bannerService.GetTopBanner());
        }

        [HttpGet("maintenance")]
        public ActionResult<Models.DTOs.MaintenanceDTO?> GetMaintenanceInfo()
        {
            return Ok(_maintenanceService.IsActive && _maintenanceService.End >= Utils.CustomDateTime.CurrentTime ? new Models.DTOs.MaintenanceDTO() { Start = _maintenanceService.Start, End = _maintenanceService.End, Message = _maintenanceService.Message! } : null);
        }

        [HttpGet]
        public ActionResult<Models.DTOs.ServerInfoDTO> GetServerInfo()
        {
            return Ok(_systemSettingsService.ServerInfo);
        }
    }
}
