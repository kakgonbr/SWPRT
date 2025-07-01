using Microsoft.EntityFrameworkCore;
using rental_services.Server.Data;
using rental_services.Server.Models;

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

        public async Task<List<ChatMessage>> GetMessagesForChatAsync(int chatId)
        {
            return await _context.ChatMessages
                .Where(m => m.ChatId == chatId)
                .OrderBy(m => m.ChatMessageId)
                .ToListAsync();
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
    }
}
