namespace rental_services.Server.Services
{
    public class ImageService : IImageService
    {
        private static readonly HashSet<ImageUploadTracker> _imageTrackers = new();
        private readonly ILogger<ImageService> _logger;
        public ImageService(ILogger<ImageService> logger)
        {
            _logger = logger;
        }
        private class ImageUploadTracker
        {
            public DateTime UploadTime { get; init; }
            public bool IsExpired => UploadTime.AddMinutes(Utils.Config.Image.ExpireInMinutes) < Utils.CustomDateTime.CurrentTime;
            public int CustomerId { get; init; }
            public string ImageName { get; init; } = null!;
            public ImageUploadTracker()
            {
                UploadTime = Utils.CustomDateTime.CurrentTime;
            }

            public override bool Equals(object? obj)
            {
                if (obj is ImageUploadTracker other)
                    return CustomerId == other.CustomerId;

                return false;
            }

            public override int GetHashCode()
            {
                return CustomerId;
            }

            public override string ToString()
            {
                return $"Tracker: CID : {CustomerId}, IMG: {ImageName}";
            }
        }

        public void CleanupPending()
        {
            foreach (var tracker in _imageTrackers)
            {
                if (tracker.IsExpired)
                {
                    _logger.LogInformation("Clearing tracker for {CustomerId}", tracker.CustomerId);

                    DeleteImage(tracker.ImageName);

                    _imageTrackers.Remove(tracker);
                }
            }
        }

        private void DeleteImage(string name)
        {
            _logger.LogInformation("Deleting {Name}", name);

            string fullPath = Path.Combine(Utils.Config.Image.ImagePath, name);

            if (System.IO.File.Exists(fullPath))
            {
                try
                {
                    System.IO.File.Delete(fullPath);

                    _logger.LogInformation("Deleted {Path}.", fullPath);
                }
                catch (Exception e)
                {
                    _logger.LogError(e, "Image deletion failed.");
                }
            }
            else
            {
                _logger.LogInformation("{Name} not found.", name);
            }
        }

        public void CheckImagePresent(string imageName, int userId)
        {
            if (_imageTrackers.Contains(new() { CustomerId = userId }))
            {
                ImageUploadTracker? tracker = _imageTrackers.FirstOrDefault(t => t.CustomerId == userId);

                if (tracker is not null)
                {
                    DeleteImage(tracker.ImageName);
                }
            }

            ImageUploadTracker newTracker = new() { CustomerId = userId, ImageName = imageName };

            _imageTrackers.Remove(newTracker);
            _imageTrackers.Add(newTracker);
        }

        /// <summary>
        /// MUST BE CALLED TO PERSISTENTLY SAVE CUSTOMER UPLOADED IMAGE.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns>true if the image was consumed, false if the image was not present</returns>
        public bool ConsumeImage(int userId)
        {
            return _imageTrackers.Remove(new() { CustomerId = userId });
        }
    }
}
