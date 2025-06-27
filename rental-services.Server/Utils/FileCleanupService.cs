using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace rental_services.Server.Utils
{
    /// <summary>
    /// Runs every few days, clean files older than 30 days in the directory stated in the config
    /// </summary>
    public class FileCleanupService : BackgroundService
    {
        private readonly ILogger<FileCleanupService> _logger;

        public FileCleanupService(ILogger<FileCleanupService> logger)
        {
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    CleanOldFiles();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error cleaning files");
                }

                await Task.Delay(Config.Image.CleanupInterval, stoppingToken);
            }
        }

        private void CleanOldFiles()
        {
            if (!Directory.Exists(Config.Image.ImagePath))
            {
                _logger.LogWarning("Directory does not exist: {Directory}", Config.Image.ImagePath);
                return;
            }

            var files = Directory.GetFiles(Config.Image.ImagePath);

            foreach (var file in files)
            {
                var fileInfo = new FileInfo(file);
                if (fileInfo.LastWriteTime < DateTime.Now.AddDays(-30))
                {
                    try
                    {
                        fileInfo.Delete();
                        _logger.LogInformation("Deleted file: {File}", file);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to delete file: {File}", file);
                    }
                }
            }
        }
    }
}