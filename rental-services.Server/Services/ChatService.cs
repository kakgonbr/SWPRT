using rental_services.Server.Models;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Repositories;
using AutoMapper;

namespace rental_services.Server.Services
{
    public class ChatService : IChatService
    {
        private readonly IChatRepository _chatRepository;
        private readonly IMapper _mapper;
        public ChatService(IChatRepository chatRepository, IMapper mapper)
        {
            _chatRepository = chatRepository;
            _mapper = mapper;
        }

        public async Task<List<ChatDTO>> GetAllChatsAsync()
        {
            var chats = await _chatRepository.GetAllChatsAsync();
            return _mapper.Map<List<ChatDTO>>(chats);
        }

        public async Task<List<ChatMessageDTO>> GetMessagesForChatAsync(int chatId, DateTime? after = null, DateTime? before = null, int? limit = null)
        {
            var messages = await _chatRepository.GetMessagesForChatAsync(chatId, after, before, limit);
            return _mapper.Map<List<ChatMessageDTO>>(messages);
        }

        public async Task<ChatDTO> CreateChatAsync(int userId, string? subject, string? priority)
        {
            var chat = new Chat
            {
                UserId = userId,
                Status = "Unresolved",
                Priority = priority ?? "Low",
                OpenTime = System.DateTime.UtcNow,
                Subject = subject ?? "General Chat"
            };
            await _chatRepository.AddChatAsync(chat);
            return _mapper.Map<ChatDTO>(chat);
        }

        public async Task<ChatDTO?> AssignStaffAsync(int chatId, int staffId)
        {
            var chat = await _chatRepository.AssignStaffAsync(chatId, staffId);
            return chat == null ? null : _mapper.Map<ChatDTO>(chat);
        }

        public async Task<ChatMessageDTO> AddMessageAsync(int chatId, int senderId, string content)
        {
            var message = new ChatMessage
            {
                ChatId = chatId,
                SenderId = senderId,
                Content = content
            };
            await _chatRepository.AddMessageAsync(message);
            return _mapper.Map<ChatMessageDTO>(message);
        }

        public async Task<int> GetIDBasedOnMailForChat(string email)
        {
            if (string.IsNullOrEmpty(email))
                return 0; 
            return await _chatRepository.GetIDBasedOnMail(email);
        }

        public async Task<ChatDTO?> GetChatByUserIdAsync(int userId)
        {
            if (userId <= 0)
            {
                return null;
            }
            var chat = await _chatRepository.GetChatByUserIdAsync(userId);
            return chat == null ? null : _mapper.Map<ChatDTO>(chat);
        }

        public async Task<ChatDTO?> UpdateChatAsync(ChatDTO chatDTO)
        {
            if (chatDTO is null)
                return null;    
            var chat = _mapper.Map<Chat>(chatDTO);
            return await _chatRepository.UpdateChatAsync(chat) > 0 ? chatDTO : null;
        }
    }
}
