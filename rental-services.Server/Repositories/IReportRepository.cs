using rental_services.Server.Models;

namespace rental_services.Server.Repositories
{
    public interface IReportRepository
    {
        Task<List<Report>> GetAllReportsAsync();
        Task<Report?> GetReportByIdAsync(int reportId);
        Task<List<Report>> GetReportsByTypeIdAsync(int typeId);
        Task<int> CreateReportAsync(Report report);
        Task<int> UpdateReportAsync(Report report);
        //this method can be updated to get reports by address: staff address == user address 
        Task<List<Report>> GetReportsPaginatedAsync(int pageNumber, int pageSize);
    }
}
