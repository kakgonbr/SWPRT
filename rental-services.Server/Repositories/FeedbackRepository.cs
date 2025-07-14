using rental_services.Server.Data;
using rental_services.Server.Models;
using System.Threading.Tasks;

namespace rental_services.Server.Repositories
{
    public class FeedbackRepository : IFeedbackRepository
    {
        private readonly RentalContext _context;
        public FeedbackRepository(RentalContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Feedback feedback)
        {
            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();
        }
    }
} 