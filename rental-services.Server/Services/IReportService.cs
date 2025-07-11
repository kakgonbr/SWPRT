using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Services
{
    public interface IReportService
    {
        Task<List<ReportDTO>> GetAllReportsAsync();
        Task<ReportDTO?> GetReportByIdAsync(int reportId);
        Task<bool> CreateReportAsync(ReportDTO reportDTO);
        Task<bool> UpdateReportAsync(ReportDTO reportDTO);
        Task<List<ReportDTO>> GetReportsPaginatedAsync(int page, int pageSize);
    }
}
