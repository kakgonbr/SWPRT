﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using rental_services.Server.Services;
using System.Security.Claims;

namespace rental_services.Server.Controllers.Realtime
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;

        public ChatHub(IChatService chatService)
        {
            _chatService = chatService;
        }

        // Join a chat group
        public async Task JoinChat(int chatId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"chat-{chatId}");
        }

        // Send a message to a chat
        public async Task SendMessage(int chatId, string content)
        {
            var userId = int.Parse(Context.User.FindFirstValue("VroomVroomUserId")!);
            //var userId = await _chatService.GetIDBasedOnMailForChat(Context.User.FindFirstValue(ClaimTypes.Email) ?? string.Empty);
            var messageDto = await _chatService.AddMessageAsync(chatId, userId, content);
            await Clients.Group($"chat-{chatId}").SendAsync("ReceiveMessage", messageDto);
        }

        // Assign staff to a chat
        [Authorize(Roles = "staff")]
        public async Task AssignStaff(int chatId)
        {
            var staffId = int.Parse(Context.User.FindFirstValue("VroomVroomUserId")!);
            //var staffId = await _chatService.GetIDBasedOnMailForChat(Context.User.FindFirstValue(ClaimTypes.Email) ?? string.Empty);
            var chatDto = await _chatService.AssignStaffAsync(chatId, staffId);
            await Clients.Group($"chat-{chatId}").SendAsync("StaffAssigned", chatDto);
        }
    }
}
