using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Services
{
    public interface IGoogleOAuthService
    {
        /// <summary>
        /// Generates a Google OAuth 2.0 authorization URL for user authentication.
        /// </summary>
        /// <returns>A <see cref="string"/> containing the complete Google OAuth authorization URL with required parameters.</returns>
        /// <remarks>
        /// The generated URL includes client ID, redirect URI, scopes (openid, email, profile), response type, state for CSRF protection,
        /// access type set to offline, and prompt set to consent to ensure refresh token is provided.
        /// </remarks>
        string GenerateGoogleOAuthUrl();
        
        /// <summary>
        /// Exchanges the authorization code received from Google OAuth callback for user information.
        /// </summary>
        /// <param name="authorizationCode">The authorization code returned by Google OAuth after user consent.</param>
        /// <returns>A <see cref="GoogleUserInfo"/> object containing the user's email, name, Google ID, and email verification status.</returns>
        /// <exception cref="InvalidOperationException">Thrown if the token exchange fails or user info retrieval fails.</exception>
        /// <remarks>
        /// This method performs a two-step process: first exchanges the authorization code for an access token,
        /// then uses the access token to retrieve user information from Google's userinfo endpoint.
        /// </remarks>
        Task<GoogleUserInfo> GetUserInfoFromCodeAsync(string authorizationCode);
    }
}