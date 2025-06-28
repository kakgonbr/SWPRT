using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Services;
using System.Security.Claims;

namespace rental_services.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatsController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly ILogger<ChatsController> _logger;

        public ChatsController(IChatService chatService, ILogger<ChatsController> logger)
        {
            _chatService = chatService;
            _logger = logger;
        }

        // GET: api/chats
        // get all chats
        [HttpGet]
        [Authorize(Roles = "Staff")]
        public async Task<ActionResult<IEnumerable<ChatDTO>>> GetChats()
        {
            var chats = await _chatService.GetAllChatsAsync();
            return Ok(chats);
        }

        // GET: api/mychat
        // get chat by user id
        [HttpGet("mychat")]
        public async Task<ActionResult<ChatDTO>> GetChatByUserId()
        {
            var userId = int.Parse(User.FindFirstValue("VroomVroomUserId")!);
            return Ok(await _chatService.GetChatByUserIdAsync(userId));
          
        }

        // GET: api/chats/{chatId}/messages
        // get messages for a specific chat
        [HttpGet("{chatId}/messages")]
        public async Task<ActionResult<IEnumerable<ChatMessageDTO>>> GetMessages(int chatId)
        {
            var userId = int.Parse(User.FindFirstValue("VroomVroomUserId")!);
            //var userId = await _chatService.GetIDBasedOnMailForChat(User.FindFirstValue(ClaimTypes.Email) ?? string.Empty);
            //test
            if (userId == 0)
                return Forbid("lack claim id in the token");
            var isCustomer = User.IsInRole("Customer");
            _logger.LogInformation("User {UserId} is a {Role} and is requesting messages for chat {ChatId}", userId, isCustomer ? "Customer" : "Staff", chatId);
            var messages = await _chatService.GetMessagesForChatAsync(chatId, userId, isCustomer);
            if (messages.Count() == 0)
            {
                // if no messages, add a welcome message
                return Ok( await _chatService.AddMessageAsync(chatId, userId, "You can chat with a staff now."));
            }
            return Ok(messages);
        }

        // POST: api/chats (customer starts chat)
        // create a new chat
        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<ChatDTO>> CreateChat([FromBody] CreateChatRequest request)
        {
            var userId = int.Parse(User.FindFirstValue("VroomVroomUserId")!);
            //var userId = await _chatService.GetIDBasedOnMailForChat(User.FindFirstValue(ClaimTypes.Email) ?? string.Empty);
            //test
            if (userId == 0)
                return Forbid("lack claim id in the token");
            var chat = await _chatService.CreateChatAsync(userId, request.Subject, request.Priority);
            return Ok(chat);
        }

        // POST: api/chats/{chatId}/assign
        // assign staff to a chat
        [HttpPost("{chatId}/assign")]
        //[Authorize(Roles = "Staff")]
        public async Task<ActionResult<ChatDTO>> AssignStaff(int chatId)
        {
            var staffId = int.Parse(User.FindFirstValue("VroomVroomUserId")!);
            //var staffId = await _chatService.GetIDBasedOnMailForChat(User.FindFirstValue(ClaimTypes.Email) ?? string.Empty);
            //test
            if (staffId == 0)
                return Forbid("lack claim id in the token");
            var chat = await _chatService.AssignStaffAsync(chatId, staffId);
            if (chat == null) 
                return NotFound();
            return Ok(chat);
        }
    }

    public class CreateChatRequest
    {
        public string? Subject { get; set; }
        public string? Priority { get; set; }
    }
}
