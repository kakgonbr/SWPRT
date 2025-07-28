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
            var currentDateTime = DateTime.Now;
            var currentDate = DateOnly.FromDateTime(DateTime.Now);

            Models.DTOs.ServerStatisticsDTO serverStatistics = new()
            {
                TotalUsers = await _rentalContext.Users.Where(u => u.IsActive).CountAsync(),
                RecentUsers = await _rentalContext.Users.Where(u => u.IsActive && u.CreationDate.AddDays(30) > currentDate).CountAsync(),
                TotalBikes = await _rentalContext.VehicleModels.CountAsync(),
                AvailableBikes = await _rentalContext.VehicleModels.Where(vm => vm.IsAvailable).CountAsync(),
                ActiveRentals = await _rentalContext.Bookings.Where(b => !b.Status.Equals("Awaiting Payment") && !b.Status.Equals("Cancelled") && b.StartDate > currentDate && b.EndDate < currentDate).CountAsync(),
                MonthlyRevenue = await _rentalContext.Payments.Where(p => p.PaymentDate.AddDays(30) > currentDateTime).Select(p => p.AmountPaid).SumAsync()
            };

            return serverStatistics;
        }

        public async Task<List<Models.DTOs.ServerStatisticsDTO>> GetOfDuration(int? days = null)
        {
            var currentDate = DateOnly.FromDateTime(DateTime.Now);
            var currentDateTime = DateTime.Now;
            var serverStatistics = new List<Models.DTOs.ServerStatisticsDTO>();

            async Task<Models.DTOs.ServerStatisticsDTO> BuildSnapshotAsync(int daysBack)
            {
                return new Models.DTOs.ServerStatisticsDTO
                {
                    TotalUsers = await _rentalContext.Users
                        .Where(u => u.IsActive &&
                                    EF.Functions.DateDiffDay(u.CreationDate, currentDate) >= daysBack)
                        .CountAsync(),

                    ActiveRentals = await _rentalContext.Bookings
                        .Where(b => b.Status != Utils.Config.BookingStatus.AwaitingPayment &&
                                    b.Status != Utils.Config.BookingStatus.Cancelled &&
                                    EF.Functions.DateDiffDay(b.StartDate, currentDate) >= daysBack)
                        .CountAsync(),

                    MonthlyRevenue = await _rentalContext.Payments
                        .Where(p => EF.Functions.DateDiffDay(p.PaymentDate, currentDateTime) >= daysBack)
                        .SumAsync(p => (decimal?)p.AmountPaid) ?? 0m
                };
            }

            if (days is null or 0)
            {
                for (var d = 0; ; ++d)
                {
                    var snap = await BuildSnapshotAsync(d);
                    serverStatistics.Add(snap);

                    if (snap.TotalUsers == 0 && snap.ActiveRentals == 0 && snap.MonthlyRevenue == 0)
                        break;
                }
            }
            else
            {
                for (var d = 0; d <= days; ++d)
                    serverStatistics.Add(await BuildSnapshotAsync(d));
            }

            return serverStatistics;
        }

    }
}
