using Microsoft.EntityFrameworkCore;

namespace rental_services.Server.Repositories
{
    public class StatisticsRepository : IStatisticsRepository
    {
        private readonly Data.RentalContext _rentalContext;

        public StatisticsRepository(Data.RentalContext rentalContext)
        {
            _rentalContext = rentalContext;
        }

        public async Task<Models.DTOs.ServerStatisticsDTO> GetStatistics()
        {
            // sql uses its own time, no custom time needed
            var currentDate = DateOnly.FromDateTime(DateTime.Now);

            Models.DTOs.ServerStatisticsDTO serverStatistics = new();

            serverStatistics.TotalUsers = await _rentalContext.Users.Where(u => u.IsActive).CountAsync();
            serverStatistics.RecentUsers = await _rentalContext.Users.Where(u => u.IsActive && u.CreationDate.AddDays(30) > currentDate).CountAsync();
            serverStatistics.TotalBikes = await _rentalContext.VehicleModels.CountAsync();
            serverStatistics.AvailableBikes = await _rentalContext.VehicleModels.Where(vm => vm.IsAvailable).CountAsync();
            serverStatistics.ActiveRentals = await _rentalContext.Bookings.Where(b => !b.Status.Equals("Awaiting Payment") && !b.Status.Equals("Cancelled") && b.StartDate > currentDate && b.EndDate < currentDate).CountAsync();
            serverStatistics.MonthlyRevenue = await _rentalContext.Payments.Where(p => p.PaymentDate.AddDays(30) > currentDate).Select(p => p.AmountPaid).SumAsync();

            return serverStatistics;
        }
    }
}
