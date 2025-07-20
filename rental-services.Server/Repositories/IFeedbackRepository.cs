using rental_services.Server.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace rental_services.Server.Repositories
{
    public interface IFeedbackRepository
    {
        Task AddAsync(Feedback feedback);
        Task<List<Feedback>> GetAllWithUserAsync();
        Task<List<Feedback>> SearchAsync(string query);
    }
} 