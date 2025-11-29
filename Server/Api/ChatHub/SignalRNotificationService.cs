using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.SignalR;

namespace Api.ChatHub
{
    public class SignalRNotificationService : INotificationService
    {
        private readonly IHubContext<ChatHub> _chatHubContext;
        private readonly IConnectionManagementService _connectionManager;

        public SignalRNotificationService(IHubContext<ChatHub> chatHubContext, IConnectionManagementService connectionManager)
        {
            _chatHubContext = chatHubContext;
            _connectionManager = connectionManager;
        }

        public async Task SendRealtimePush(Notification notification)
        {
            var connectionId = _connectionManager.GetConnectionId(notification.AccountId);

            if (connectionId != null)
            {
                await _chatHubContext.Clients.Client(connectionId)
                    .SendAsync("ReceiveNotification", notification);
            }
        }
    }
}
