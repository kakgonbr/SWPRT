using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace rental_services.Server.Services
{
    public interface IChatService
    {
        Task<List<ChatDTO>> GetAllChatsAsync();
        Task<List<ChatMessageDTO>> GetMessagesForChatAsync(int chatId, int userId, bool isCustomer);
        Task<ChatDTO> CreateChatAsync(int userId, string? subject, string? priority);
        Task<ChatDTO?> AssignStaffAsync(int chatId, int staffId);
        Task<ChatMessageDTO> AddMessageAsync(int chatId, int senderId, string content);
        Task<int> GetIDBasedOnMailForChat(string email);
        Task<ChatDTO?> GetChatByUserIdAsync(int userId);
    }
}
