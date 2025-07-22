using System.Text.Json;

namespace rental_services.Server.Services
{
    public class SystemSettingsService : ISystemSettingsService
    {
        private readonly AutoMapper.IMapper _mapper;
        public Models.DTOs.SystemSettingsDTO SystemSettings { get; set; }
        public Models.DTOs.ServerInfoDTO ServerInfo => _mapper.Map<Models.DTOs.ServerInfoDTO>(SystemSettings);

        public SystemSettingsService(AutoMapper.IMapper mapper)
        {
            _mapper = mapper;

            var json = File.ReadAllText("appsettings.json");
            using var doc = JsonDocument.Parse(json);
            var section = doc.RootElement.GetProperty("SystemSettings");
            var settings = section.Deserialize<Models.DTOs.SystemSettingsDTO>();

            if (settings is null)
            {
                throw new Exception("Cannot read appsettings.json");
            }

            SystemSettings = settings;
        }
    }
}
