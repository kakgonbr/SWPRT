using Microsoft.EntityFrameworkCore;
using rental_services.Server.Data;
using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;

namespace rental_services.Server.Repositories
{
    public class ChatRepository : IChatRepository
    {
        private readonly RentalContext _context;
        public ChatRepository(RentalContext context)
        {
            _context = context;
        }

        public async Task<List<Chat>> GetAllChatsAsync()
        {
            return await _context.Chats
                .Include(c => c.User)
                .Include(c => c.Staff)
                .ToListAsync();
        }

        public async Task<Chat?> GetChatByIdAsync(int chatId)
        {
            return await _context.Chats
                .Include(c => c.ChatMessages)
                .FirstOrDefaultAsync(c => c.ChatId == chatId);
        }

        // Paginated and filtered message fetching
        public async Task<List<ChatMessage>> GetMessagesForChatAsync(int chatId, DateTime? after = null, DateTime? before = null, int? limit = null)
        {
            var query = _context.ChatMessages.Where(m => m.ChatId == chatId);

            if (after.HasValue)
            {
                query = query.Where(m => m.SendTime > after.Value);
            }
            if (before.HasValue)
            {
                query = query.Where(m => m.SendTime < before.Value);
            }

            query = query.OrderByDescending(m => m.SendTime);

            if (limit.HasValue)
            {
                query = query.Take(limit.Value);
            }

            // Return in ascending order for UI
            return (await query.ToListAsync()).OrderBy(m => m.SendTime).ToList();
        }

        public async Task<Chat> AddChatAsync(Chat chat)
        {
            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();
            return chat;
        }

        public async Task<Chat?> AssignStaffAsync(int chatId, int staffId)
        {
            var chat = await _context.Chats.FirstOrDefaultAsync(c => c.ChatId == chatId);
            if (chat == null) 
                return null;
            chat.StaffId = staffId;
            await _context.SaveChangesAsync();
            return chat;
        }

        public async Task<ChatMessage> AddMessageAsync(ChatMessage message)
        {
            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();
            return message;
        }

        public async Task<int> GetIDBasedOnMail(string email)
        {
            return await _context.Users
                .Where(u => u.Email.ToLower().Equals(email.ToLower()))
                .Select(u => u.UserId)
                .FirstOrDefaultAsync();
        }

        public Task<Chat?> GetChatByUserIdAsync(int userId)
        {
            return _context.Chats
                .Include(c => c.ChatMessages)
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public async Task<int> UpdateChatAsync(Chat chat)
        {
            _context.Chats.Update(chat);
            return await _context.SaveChangesAsync();
        }

        //get chats assigned to a staff or not assigned, paginated, can be filtered by address on later update
        public async Task<List<Chat>> GetChatsByStaffAsync(int staffId, int page, int pageSize)
        {
            return await _context.Chats
                .Where(c => c.StaffId == staffId || c.StaffId == null)
                .Include(c => c.User)
                .Include(c => c.Staff)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<bool> MarkCustomerMessagesAsReadAsync(int chatId)
        {
            var chat = await _context.Chats.Include(c => c.ChatMessages).FirstOrDefaultAsync(c => c.ChatId == chatId);
            if (chat == null)
                return false;
            var customerId = chat.UserId;
            var unreadMessages = chat.ChatMessages.Where(m => m.SenderId == customerId && !m.IsRead).ToList();
            foreach (var message in unreadMessages)
            {
                message.IsRead = true;
            }
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> HaveUnreadChatMessagesAsync(ChatDTO chat)
        {
            return await _context.ChatMessages.AnyAsync(m => m.ChatId == chat.ChatId && !m.IsRead && m.SenderId == chat.UserId);
        }
    }
}
