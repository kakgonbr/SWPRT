using Microsoft.EntityFrameworkCore;
using rental_services.Server.Data;
using rental_services.Server.Models;

namespace rental_services.Server.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly RentalContext _context;
        public ReportRepository(RentalContext context)
        {
            _context = context;
        }

        public async Task<int> CreateReportAsync(Report report)
        {
            await _context.Reports.AddAsync(report);
            return await _context.SaveChangesAsync();
        }

        public async Task<List<Report>> GetAllReportsAsync()
        {
            return await _context.Reports
                .Include(r => r.User)
                .Include(r => r.Type)
                .ToListAsync();
        }

        public async Task<Report?> GetReportByIdAsync(int reportId)
        {
            return await _context.Reports
                .Include(r => r.User)
                .Include(r => r.Type)
                .SingleOrDefaultAsync(r => r.ReportId == reportId);
        }

        public async Task<List<Report>> GetReportsByTypeIdAsync(int typeId)
        {
            return await _context.Reports
                .Where(r => r.TypeId == typeId)
                .Include(r => r.User)
                .Include(r => r.Type)
                .ToListAsync();
        }

        public Task<List<Report>> GetReportsPaginatedAsync(int pageNumber, int pageSize)
        {
            return _context.Reports
                .Include(r => r.User)
                .Include(r => r.Type)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public Task<int> UpdateReportAsync(Report report)
        {
            _context.Reports.Update(report);
            return _context.SaveChangesAsync();
        }
    }
}
