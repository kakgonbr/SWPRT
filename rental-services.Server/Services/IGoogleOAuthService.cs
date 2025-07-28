using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Services
{
    public interface IGoogleOAuthService
    {
        string GenerateGoogleOAuthUrl();
        Task<GoogleUserInfo> GetUserInfoFromCodeAsync(string authorizationCode);
    }
}