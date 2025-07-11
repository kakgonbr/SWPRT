using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Services;

namespace rental_services.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
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
            return await _reportService.CreateReportAsync(reportDTO) ? Ok(reportDTO) : BadRequest("Failed to create report.");
        }

        [HttpPost("update")]
        [Authorize]
        public async Task<ActionResult<ReportDTO>> UpdateReport([FromBody]ReportDTO reportDTO)
        {
            if (reportDTO is null)
                return BadRequest("Report data is null.");
            return await _reportService.UpdateReportAsync(reportDTO) ? Ok(reportDTO) : BadRequest("Failed to update report.");
        }
    }
}
