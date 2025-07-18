﻿using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace rental_services.Server.Repositories
{
    public interface IChatRepository
    {
        Task<List<Chat>> GetAllChatsAsync();
        Task<Chat?> GetChatByIdAsync(int chatId);
        Task<Chat?> GetChatByUserIdAsync(int userId);
        Task<List<ChatMessage>> GetMessagesForChatAsync(int chatId, DateTime? after = null, DateTime? before = null, int? limit = null);
        Task<Chat> AddChatAsync(Chat chat);
        Task<Chat?> AssignStaffAsync(int chatId, int staffId);
        Task<ChatMessage> AddMessageAsync(ChatMessage message);
        Task<int> GetIDBasedOnMail(string email);
        Task<int> UpdateChatAsync(Chat chat);
        Task<List<Chat>> GetChatsByStaffAsync(int staffId, int page, int pageSize);
        Task<bool> MarkCustomerMessagesAsReadAsync(int chatId);
        Task<bool> HaveUnreadChatMessagesAsync(ChatDTO chat);
    }
}
