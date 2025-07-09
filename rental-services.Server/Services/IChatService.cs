using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace rental_services.Server.Services
{
    public interface IChatService
    {
        Task<List<ChatDTO>> GetAllChatsAsync();
        Task<List<ChatMessageDTO>> GetMessagesForChatAsync(int chatId, DateTime? after = null, DateTime? before = null, int? limit = null);
        Task<ChatDTO> CreateChatAsync(int userId, string? subject, string? priority);
        Task<ChatDTO?> AssignStaffAsync(int chatId, int staffId);
        Task<ChatMessageDTO> AddMessageAsync(int chatId, int senderId, string content);
        Task<int> GetIDBasedOnMailForChat(string email);
        Task<ChatDTO?> GetChatByUserIdAsync(int userId);
        Task<ChatDTO?> UpdateChatAsync(ChatDTO chatDTO); 
        Task<List<ChatDTO>> GetChatsByStaffAsync(int staffId, int skip, int take);
    }
}
