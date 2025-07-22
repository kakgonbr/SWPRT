namespace rental_services.Server.Services
{
    public interface IImageService
    {
        void CheckImagePresent(string imageName, int userId);
        void CleanupPending();
    }
}