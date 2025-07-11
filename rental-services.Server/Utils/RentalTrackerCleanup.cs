namespace rental_services.Server.Utils
{
    /// <summary>
    /// UNUSED
    /// Runs every few days, clean files older than 30 days in the directory stated in the config
    /// </summary>
    public class RentalTrackerCleanup : BackgroundService
    {
        private readonly ILogger<RentalTrackerCleanup> _logger;
        private readonly Services.IRentalService _rentalService;

        public RentalTrackerCleanup(ILogger<RentalTrackerCleanup> logger, Services.IRentalService rentalService)
        {
            _logger = logger;
            _rentalService = rentalService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await _rentalService.CleanupPendingAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error cleaning up rental trackers: {Message}", ex.Message);
                }

                await Task.Delay(Config.Image.CleanupInterval, stoppingToken);
            }
        }
    }
}