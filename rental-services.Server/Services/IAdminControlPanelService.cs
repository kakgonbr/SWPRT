using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Services
{
    public interface IAdminControlPanelService
    {
        Task<bool> AddBannerAsync(BannerDTO newBanner);
        Task<bool> DeleteBannerAsync(int bannerId);
        Task<bool> EditBannerAsync(BannerDTO editBanner);
        Task<List<BannerDTO>> GetAllbannersAsync();
        Task<ServerStatisticsDTO> GetStatisticsAsync();
        Task<BannerDTO?> GetTopBanner();
    }
}