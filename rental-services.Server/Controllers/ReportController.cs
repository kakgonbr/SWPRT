using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;
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
        public async Task<ActionResult<List<ReportDTO>>> GetAllReports()
        {
            var reports = await _reportService.GetAllReportsAsync();
            return Ok(reports);
        }

        [HttpGet("{id}")]
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

        [HttpGet("type/{typeId}")]
        public async Task<ActionResult<List<ReportDTO>>> GetReportsByTypeId(int typeId)
        {
            if (typeId < 0)
            {
                return BadRequest("Type ID must be greater than zero.");
            }
            var reports = await _reportService.GetReportsByTypeIdAsync(typeId);
            return reports == null ? NotFound("reporst is null") : Ok(reports);
        }

        [HttpPost]
        public async Task<ActionResult<string>> AddReport(ReportDTO reportDTO)
        {
            if (reportDTO is null)
                return BadRequest("Report data is null.");
            return await _reportService.CreateReportAsync(reportDTO) ? Ok("Report created successfully.") : BadRequest("Failed to create report.");
        }

    }
}
