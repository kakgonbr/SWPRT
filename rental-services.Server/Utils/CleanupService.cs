namespace rental_services.Server.Utils
{
    public class CleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<CleanupService> _logger;
        //private readonly TimeSpan _interval = TimeSpan.FromMinutes(5);
        private readonly TimeSpan _interval = TimeSpan.FromSeconds(10);

        public CleanupService(IServiceProvider serviceProvider, ILogger<CleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("CleanupService started.");

            using (var scope = _serviceProvider.CreateScope())
            {
                _logger.LogInformation("Populating untracked rentals.");

                var rentalService = scope.ServiceProvider.GetRequiredService<Services.IRentalService>();
                await rentalService.PopulateTrackers();
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var rentalService = scope.ServiceProvider.GetRequiredService<Services.IRentalService>();
                        await rentalService.CleanupPendingAsync();

                        var imageService = scope.ServiceProvider.GetRequiredService<Services.IImageService>();
                        imageService.CleanupPending();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during cleanup");
                }

                await Task.Delay(_interval, stoppingToken);
            }

            _logger.LogInformation("CleanupService stopped.");
        }
    }
}