using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Services
{
    public interface IReportService
    {
        Task<List<ReportDTO>> GetAllReportsAsync();
        Task<ReportDTO?> GetReportByIdAsync(int reportId);
        Task<List<ReportDTO>> GetReportsByTypeIdAsync(int typeId);
        Task<bool> CreateReportAsync(ReportDTO reportDTO);

    }
}
