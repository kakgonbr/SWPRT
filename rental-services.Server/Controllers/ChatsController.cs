using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using rental_services.Server.Models.DTOs;
using rental_services.Server.Services;
using System.Security.Claims;
using rental_services.Server.Controllers.Realtime;

namespace rental_services.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatsController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly ILogger<ChatsController> _logger;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatsController(IChatService chatService, ILogger<ChatsController> logger, IHubContext<ChatHub> hubContext)
        {
            _chatService = chatService;
            _logger = logger;
            _hubContext = hubContext;
        }

        // GET: api/chats
        // get all chats
        [HttpGet]
        [Authorize(Roles = Utils.Config.Role.Staff)]
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
        public async Task<ActionResult<IEnumerable<ChatMessageDTO>>> GetMessages(int chatId, [FromQuery] string? after = null, [FromQuery] string? before = null, [FromQuery] int? limit = null)
        {
            var userIdClaim = User.FindFirstValue("VroomVroomUserId");
            if (string.IsNullOrEmpty(userIdClaim))
                return Forbid("lack claim id in the token");
            var userId = int.Parse(userIdClaim);
            var isCustomer = User.IsInRole("Customer");
            _logger.LogInformation("User {UserId} is a {Role} and is requesting messages for chat {ChatId}", userId, isCustomer ? "Customer" : "Staff", chatId);

            DateTime? afterTime = null;
            DateTime? beforeTime = null;
            if (!string.IsNullOrEmpty(after))
                afterTime = DateTime.Parse(after, null, System.Globalization.DateTimeStyles.RoundtripKind);
            if (!string.IsNullOrEmpty(before))
                beforeTime = DateTime.Parse(before, null, System.Globalization.DateTimeStyles.RoundtripKind);

            var messages = await _chatService.GetMessagesForChatAsync(chatId, afterTime, beforeTime, limit);
            if (messages.Count == 0 && afterTime == null && beforeTime == null)
            {
                // if no messages and this is the initial load, add a welcome message
                return Ok(await _chatService.AddMessageAsync(chatId, userId, "You can chat with a staff now."));
            }
            return Ok(messages);
        }

        // POST: api/chats (customer starts chat)
        // create a new chat
        [HttpPost]
        [Authorize(Roles = Utils.Config.Role.Customer)]
        public async Task<ActionResult<ChatDTO>> CreateChat([FromBody] CreateChatRequest request)
        {
            var userIdClaim = User.FindFirstValue("VroomVroomUserId");
            if (string.IsNullOrEmpty(userIdClaim))
                return Forbid("lack claim id in the token");
            var userId = int.Parse(userIdClaim);
            var chat = await _chatService.CreateChatAsync(userId, request.Subject, request.Priority);
            return Ok(chat);
        }

        // POST: api/chats/{chatId}/assign
        // assign staff to a chat
        [HttpPost("{chatId}/assign")]
        [Authorize(Roles = Utils.Config.Role.Staff)]
        public async Task<ActionResult<ChatDTO>> AssignStaff(int chatId)
        {
            var userIdClaim = User.FindFirstValue("VroomVroomUserId");
            if (string.IsNullOrEmpty(userIdClaim))
                return Forbid("lack claim id in the token");
            var staffId = int.Parse(userIdClaim);
            var chat = await _chatService.AssignStaffAsync(chatId, staffId);
            if (chat == null) 
                return NotFound();
            // Notify all staff clients about the update, setting the chat as assigned 
            await _hubContext.Clients.All.SendAsync("ChatUpdated", chat);
            return Ok(chat);
        }

        //POST: api/chats/{chatID}/update
        // update chat status or priority
        [HttpPost("{chatID}/update")]
        [Authorize(Roles =Utils.Config.Role.Staff)]
        public async Task<ActionResult<ChatDTO>> UpdateChat([FromBody]ChatDTO chatDTO)
        {
            var chat = await _chatService.UpdateChatAsync(chatDTO);
            if (chat is null)
                return BadRequest("Chat not found or invalid data.");
            return Ok(chat);
        }

        // GET: api/chats/paginated?skip=0&take=5
        [HttpGet("paginated")]
        [Authorize(Roles = Utils.Config.Role.Staff)]
        public async Task<ActionResult<IEnumerable<ChatDTO>>> GetChatsPaginated([FromQuery] int page = 0, [FromQuery] int pageSize = 1)
        {
            var userIdClaim = User.FindFirstValue("VroomVroomUserId");
            if (string.IsNullOrEmpty(userIdClaim))
                return Forbid("lack claim id in the token");
            var staffId = int.Parse(userIdClaim);
            var chats = await _chatService.GetChatsByStaffAsync(staffId, page, pageSize);
            return Ok(chats);
        }
    }

    public class CreateChatRequest
    {
        public string? Subject { get; set; }
        public string? Priority { get; set; }
    }
}
