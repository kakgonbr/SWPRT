namespace rental_services.Server.Utils
{
    public class RentalTrackerCleanup : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<RentalTrackerCleanup> _logger;
        private readonly TimeSpan _interval = TimeSpan.FromMinutes(5);

        public RentalTrackerCleanup(IServiceProvider serviceProvider, ILogger<RentalTrackerCleanup> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("RentalTrackerCleanup started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var rentalService = scope.ServiceProvider.GetRequiredService<Services.IRentalService>();
                        await rentalService.CleanupPendingAsync();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during cleanup");
                }

                await Task.Delay(_interval, stoppingToken);
            }

            _logger.LogInformation("RentalTrackerCleanup stopped.");
        }
    }
}