using rental_services.Server.Data;
using rental_services.Server.Models;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

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

        public async Task<List<Feedback>> GetAllWithUserAsync()
        {
            return await _context.Feedbacks.Include(f => f.User).ToListAsync();
        }

        public async Task<List<Feedback>> SearchAsync(string query)
        {
            return await _context.Feedbacks
                .Include(f => f.User)
                .Where(f =>
                    f.Title.Contains(query) ||
                    f.Body.Contains(query) ||
                    (f.User.FullName != null && f.User.FullName.Contains(query))
                )
                .ToListAsync();
        }
    }
} 