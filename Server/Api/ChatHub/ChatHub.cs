using System;
using System.Collections.Concurrent;
using System.Security.Claims;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Api.ChatHub
{
    [Authorize] // Yêu cầu xác thực JWT để kết nối đến Hub
    public class ChatHub : Hub
    {
        private readonly IConnectionManagementService _connectionManagementService;
        // Dictionary lưu trữ tin nhắn offline cho từng UserId
        // Tin nhắn sẽ được gửi khi người dùng đó online trở lại
        private static readonly ConcurrentDictionary<int, List<(int SenderId, string Message, DateTime CreatedAt)>> _offlineMessages = new();
        private readonly IAccountHelper _accountHelper;

        public ChatHub(IConnectionManagementService connectionManagementService, IAccountHelper accountHelper)
        {
            _connectionManagementService = connectionManagementService;
            _accountHelper = accountHelper;
        }

        // Xử lý khi có client kết nối đến Hub
        public override async Task OnConnectedAsync()
        {
            var userId = await _accountHelper.GetAccountId();
            _connectionManagementService.AddConnection(userId, Context.ConnectionId); // Lưu trữ ConnectionId của người dùng
            
            // Gửi thông báo đến TẤT CẢ các client rằng người dùng này đã online
            await Clients.All.SendAsync("UserStatusChanged", userId, true);
            Console.WriteLine($"User {userId} connected with ConnectionId: {Context.ConnectionId}");

            // Kiểm tra và gửi các tin nhắn offline cho người dùng vừa kết nối
            if (_offlineMessages.TryRemove(userId, out var messages))
            {
                foreach (var msg in messages)
                {
                    await Clients.Caller.SendAsync("ReceiveMessage", msg.SenderId, msg.Message);
                }
                Console.WriteLine($"Gửi lại {messages.Count} tin nhắn offline cho User {userId}");
            }

            await base.OnConnectedAsync();
        }

        // Xử lý khi có client ngắt kết nối khỏi Hub
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = await _accountHelper.GetAccountId();
            _connectionManagementService.RemoveConnection(userId); // Xóa ConnectionId của người dùng
            
            // Gửi thông báo đến TẤT CẢ các client rằng người dùng này đã offline
            await Clients.All.SendAsync("UserStatusChanged", userId, false);
            Console.WriteLine($"User {userId} disconnected.");

            await base.OnDisconnectedAsync(exception);
        }

        // Phương thức được gọi bởi client để gửi tin nhắn đến một người dùng cụ thể
        public async Task SendMessageToUser(int receiverId, string message)
        {
            var senderId = await _accountHelper.GetAccountId();

            var receiverConnectionId = _connectionManagementService.GetConnectionId(receiverId);
            // Kiểm tra xem người nhận có đang online không
            if (receiverConnectionId != null)
            {
                // Nếu online, gửi tin nhắn trực tiếp đến người nhận
                await Clients.Client(receiverConnectionId)
                    .SendAsync("ReceiveMessage", senderId, message);
                Console.WriteLine($"Tin nhắn từ {senderId} → {receiverId} đã gửi trực tiếp.");
            }
            else
            {
                // Nếu offline, lưu tin nhắn vào danh sách tin nhắn offline của người nhận
                _offlineMessages.AddOrUpdate(
                    receiverId,
                    new List<(int, string, DateTime)> { (senderId, message, DateTime.UtcNow) },
                    (_, list) =>
                    {
                        list.Add((senderId, message, DateTime.UtcNow));
                        return list;
                    });
                Console.WriteLine($"User {receiverId} offline → tin nhắn được lưu tạm thời.");
            }

            // Gửi lại cho người gửi (hiển thị tin nhắn của chính mình trong cuộc trò chuyện)
            // Sender cũng nhận được tin nhắn qua ReceiveMessage để cập nhật UI của mình.
            await Clients.Caller.SendAsync("ReceiveMessage", senderId, message);
        }

        // Phương thức tĩnh tùy chọn để dọn dẹp các tin nhắn offline đã quá cũ
        // Có thể được gọi định kỳ bởi một background service hoặc timer
        public static void CleanupOldMessages(TimeSpan maxAge)
        {
            var cutoff = DateTime.UtcNow - maxAge; // Xác định thời điểm cắt
            foreach (var kvp in _offlineMessages)
            {
                // Xóa tất cả tin nhắn trong danh sách của một user nếu chúng cũ hơn thời điểm cắt
                kvp.Value.RemoveAll(m => m.CreatedAt < cutoff);
                
                // Nếu không còn tin nhắn offline nào cho user đó, xóa key khỏi dictionary
                if (kvp.Value.Count == 0)
                {
                    _offlineMessages.TryRemove(kvp.Key, out _);
                }
            }
            Console.WriteLine($"Đã thực hiện dọn dẹp tin nhắn offline cũ hơn {maxAge.TotalMinutes} phút.");
        }
    }
}