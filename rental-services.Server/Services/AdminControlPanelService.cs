namespace rental_services.Server.Services
{
    public class AdminControlPanelService : IAdminControlPanelService
    {
        private Repositories.IBannerRepository _bannerRepository;
        private Repositories.IStatisticsRepository _statisticsRepository;
        private AutoMapper.IMapper _mapper;
        private readonly ILogger<BikeService> _logger;

        public AdminControlPanelService(Repositories.IBannerRepository bannerRepository, Repositories.IStatisticsRepository statisticsRepository, AutoMapper.IMapper mapper, ILogger<BikeService> logger)
        {
            _bannerRepository = bannerRepository;
            _statisticsRepository = statisticsRepository;
            _mapper = mapper;
            _logger = logger;
        }

        /// <summary>
        /// A detailed by id fetch is not needed, for all fields are currently at the top level.<br></br>
        /// Furthermore, in a context where the details of a specific banner is available, the list must have been already fetched, which contains the detailed information.
        /// </summary>
        /// <returns></returns>
        public async Task<List<Models.DTOs.BannerDTO>> GetAllbannersAsync()
        {
            return _mapper.Map<List<Models.DTOs.BannerDTO>>(await _bannerRepository.GetAllAsync());
        }

        public async Task<bool> AddBannerAsync(Models.DTOs.BannerDTO newBanner)
        {
            return await _bannerRepository.AddAsync(_mapper.Map<Models.Banner>(newBanner)) != 0;
        }

        public async Task<bool> EditBannerAsync(Models.DTOs.BannerDTO editBanner)
        {
            var dbBanner = await _bannerRepository.GetByIdAsync(editBanner.BannerId);

            if (dbBanner is null)
            {
                return false;
            }

            _mapper.Map(editBanner, dbBanner);

            return await _bannerRepository.SaveAsync() != 0;
        }

        public async Task<bool> DeleteBannerAsync(int bannerId)
        {
            return await _bannerRepository.DeleteAsync(bannerId) != 0;
        }

        public async Task<bool> ToggleBannerStatusAsync(int id)
        {
            var dbBanner = await _bannerRepository.GetByIdAsync(id);

            if (dbBanner is null)
            {
                return false;
            }

            dbBanner.IsActive = !dbBanner.IsActive;

            return await _bannerRepository.SaveAsync() != 0;
        }

        public async Task<Models.DTOs.BannerDTO?> GetTopBanner()
        {
            return _mapper.Map<Models.DTOs.BannerDTO>(await _bannerRepository.GetTopBanner());
        }

        public async Task<Models.DTOs.ServerStatisticsDTO> GetStatisticsAsync()
        {
            return await _statisticsRepository.GetStatistics();
        }

        public async Task<List<Models.DTOs.ServerStatisticsDTO>> GetOfDurationAsync(int? days = null)
        {
            return await _statisticsRepository.GetOfDuration(days);
        }
    }
}
