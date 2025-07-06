using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Repositories
{
    public interface IStatisticsRepository
    {
        Task<List<ServerStatisticsDTO>> GetOfDuration(int? days = null);
        Task<ServerStatisticsDTO> GetStatistics();
    }
}