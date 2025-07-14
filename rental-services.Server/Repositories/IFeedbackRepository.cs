using rental_services.Server.Models;
using System.Threading.Tasks;

namespace rental_services.Server.Repositories
{
    public interface IFeedbackRepository
    {
        Task AddAsync(Feedback feedback);
    }
} 