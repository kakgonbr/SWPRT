using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Repositories
{
    public interface IStatisticsRepository
    {
        Task<ServerStatisticsDTO> GetStatistics();
    }
}