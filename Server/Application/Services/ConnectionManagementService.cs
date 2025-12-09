using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces;

namespace Application.Services
{
    public class ConnectionManagementService : IConnectionManagementService
    {
        private readonly ConcurrentDictionary<int, string> _connections = new();
        public void AddConnection(int userId, string connectionId)
        {
            _connections[userId] = connectionId;
        }

        public void RemoveConnection(int userId)
        {
            _connections.TryRemove(userId, out _);
        }

        public string? GetConnectionId(int userId)
        {
            _connections.TryGetValue(userId, out var connectionId);
            return connectionId;
        }
    }
}
