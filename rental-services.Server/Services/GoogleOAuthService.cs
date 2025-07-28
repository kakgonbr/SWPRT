using rental_services.Server.Models.DTOs;
using System.Net;
using System.Text.Json;

namespace rental_services.Server.Services
{
    public class GoogleOAuthService : IGoogleOAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly string _clientId;
        private readonly string _clientSecret;
        private readonly string _redirectUri;

        public GoogleOAuthService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _clientId = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID") ?? throw new InvalidOperationException("Environment Variable 'GOOGLE_CLIENT_ID' not found.");
            _clientSecret = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET") ?? throw new InvalidOperationException("Environment Variable 'GOOGLE_CLIENT_SECRET' not found.");
            _redirectUri = Environment.GetEnvironmentVariable("GOOGLE_REDIRECT_URI") ?? "https://vroomvroom.click/api/auth/google/callback";
        }

        public string GenerateGoogleOAuthUrl()
        {
            var state = Guid.NewGuid().ToString();
            var scopes = "openid email profile";

            var googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth" +
                                $"?client_id={Uri.EscapeDataString(_clientId)}" +
                                $"&redirect_uri={Uri.EscapeDataString(_redirectUri)}" +
                                $"&scope={Uri.EscapeDataString(scopes)}" +
                                "&response_type=code" +
                                $"&state={state}" +
                                "&access_type=offline" +
                                "&prompt=consent";
            Console.WriteLine($"GoogleOAuthService: Generated OAuth URL: {googleAuthUrl}");
            return googleAuthUrl;
        }

        public async Task<GoogleUserInfo> GetUserInfoFromCodeAsync(string authorizationCode)
        {
            try
            {
                Console.WriteLine($"GoogleOAuthService: Starting token exchange for code: {authorizationCode}");
                // Exchange the authorization code for an access token
                var tokenResponse = await ExchangeCodeForTokenAsync(authorizationCode);
                Console.WriteLine($"GoogleOAuthService: Token exchange successful: {tokenResponse.AccessToken}");
                var userInfo = await GetUserInfoFromTokenAsync(tokenResponse.AccessToken);
                Console.WriteLine($"GoogleOAuthService: Retrieved user info: {userInfo.Email}, {userInfo.Name}");
                return userInfo;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GoogleOAuthService Error: {ex.Message}");
                throw new InvalidOperationException("Failed to retrieve user info from Google OAuth.", ex);
            }
        }

        private async Task<GoogleTokenResponse> ExchangeCodeForTokenAsync(string authorizationCode)
        {
            var tokenEndpoint = "https://oauth2.googleapis.com/token";

            var parameters = new Dictionary<string, string>
            {
                {"client_id", _clientId},
                {"client_secret", _clientSecret},
                {"code", authorizationCode},
                {"grant_type", "authorization_code"},
                {"redirect_uri", _redirectUri}
            };

            Console.WriteLine($"GoogleOAuthService: Exchanging code for token at {tokenEndpoint} with parameters: {string.Join(", ", parameters.Select(kv => $"{kv.Key}={kv.Value}"))}");

            var content = new FormUrlEncodedContent(parameters);
            var response = await _httpClient.PostAsync(tokenEndpoint, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new InvalidOperationException($"Token exchange failed: {errorContent}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var tokenResponse = JsonSerializer.Deserialize<GoogleTokenResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return tokenResponse ?? throw new InvalidOperationException("Failed to deserialize token response");
        }

        private async Task<GoogleUserInfo> GetUserInfoFromTokenAsync(string accessToken)
        {
            // Use Authorization header instead of query parameter
            var userInfoEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo";

            // Create request with Authorization header
            var request = new HttpRequestMessage(HttpMethod.Get, userInfoEndpoint);
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
            Console.WriteLine($"GoogleOAuthService: Requesting user info with Bearer token: {accessToken}");

            var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();

            Console.WriteLine($"GoogleOAuthService: User info response status: {response.StatusCode}");

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"GoogleOAuthService: User info request failed with response: {responseContent}");
                throw new InvalidOperationException($"User info request failed: {responseContent}");
            }

            var googleUser = JsonSerializer.Deserialize<GoogleApiUserInfo>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (googleUser == null)
            {
                Console.WriteLine($"GoogleOAuthService: Failed to deserialize user info response: {responseContent}");
                throw new InvalidOperationException("Failed to deserialize user info");
            }

            return new GoogleUserInfo
            {
                Email = googleUser.Email,
                Name = googleUser.Name,
                GoogleId = googleUser.Id,
                EmailVerified = googleUser.VerifiedEmail
            };
        }
    }
}
