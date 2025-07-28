using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using rental_services.Server.Controllers.Realtime;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Services;

namespace rental_services.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly IHubContext<StaffStatisticsHub> _hubContext;
        private readonly IImageService _imageService;

        public ReportController(IReportService reportService, IHubContext<StaffStatisticsHub> hubContext, IImageService imageService)
        {
            _reportService = reportService;
            _hubContext = hubContext;
            _imageService = imageService;
        }

        [HttpGet]
        [Authorize(Roles = Utils.Config.Role.Staff)]
        public async Task<ActionResult<List<ReportDTO>>> GetAllReports()
        {
            var reports = await _reportService.GetAllReportsAsync();
            return Ok(reports);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = Utils.Config.Role.Staff)]
        public async Task<ActionResult<ReportDTO?>> GetReportById(int id)
        {
            if (id <= 0)
            {
                return BadRequest("Report ID must be greater than zero.");
            }
            var report = await _reportService.GetReportByIdAsync(id);
            if (report == null)
            {
                return NotFound();
            }
            return Ok(report);
        }

        [HttpGet("paginated")]
        [Authorize(Roles = Utils.Config.Role.Staff)]
        public async Task<ActionResult<List<ReportDTO>>> GetReportsPaginated(int page, int pageSize = 1)
        {
            var reports = await _reportService.GetReportsPaginatedAsync(page, pageSize);
            return Ok(reports);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ReportDTO>> AddReport([FromBody]ReportDTO reportDTO)
        {
            if (reportDTO is null)
                return BadRequest("Report data is null.");
            var result = await _reportService.CreateReportAsync(reportDTO);
            if (result)
            {
                await _hubContext.Clients.All.SendAsync("ReportCreated", reportDTO);
                return Ok(reportDTO);
            }
            _imageService.ConsumeImage(reportDTO.UserId);
            return BadRequest("Failed to create report.");
        }

        [HttpPost("update")]
        [Authorize]
        public async Task<ActionResult<ReportDTO>> UpdateReport([FromBody]ReportDTO reportDTO)
        {
            if (reportDTO is null)
                return BadRequest("Report data is null.");
            await _hubContext.Clients.All.SendAsync("ReportUpdated", reportDTO);
            return await _reportService.UpdateReportAsync(reportDTO) ? Ok(reportDTO) : BadRequest("Failed to update report.");
        }

        [HttpGet("unresolved")]
        [Authorize(Roles = Utils.Config.Role.Staff)]
        public async Task<ActionResult<int>> GetUnresolvedReports()
        {
            var reports = await _reportService.GetUnresolvedPendingReportsAsync();
            return Ok(reports);
        }
    }
}
