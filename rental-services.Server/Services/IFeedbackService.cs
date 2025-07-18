using rental_services.Server.Models.DTOs;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace rental_services.Server.Services
{
    public interface IFeedbackService
    {
        Task<FeedbackDTO> SubmitFeedbackAsync(FeedbackDTO feedbackDto, IFormFile? screenshot, string requestScheme, string requestHost);
        Task<List<FeedbackDTO>> GetAllFeedbackAsync();
        Task<List<FeedbackDTO>> SearchFeedbackAsync(string query);
    }
} 