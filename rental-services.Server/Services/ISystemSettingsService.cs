using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Services
{
    public interface ISystemSettingsService
    {
        SystemSettingsDTO SystemSettings { get; set; }
        ServerInfoDTO ServerInfo { get; }
    }
}