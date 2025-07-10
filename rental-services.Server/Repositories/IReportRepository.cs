using rental_services.Server.Models;

namespace rental_services.Server.Repositories
{
    public interface IReportRepository
    {
        Task<List<Report>> GetAllReportsAsync();
        Task<Report?> GetReportByIdAsync(int reportId);
        //Task<List<Report>> GetReportsByUserIdAsync(int userId);
        Task<List<Report>> GetReportsByTypeIdAsync(int typeId);
        Task<int> CreateReportAsync(Report report);
        //Task<bool> UpdateReportAsync(ReportDTO reportDto);
        //Task<bool> DeleteReportAsync(int reportId);
    }
}
