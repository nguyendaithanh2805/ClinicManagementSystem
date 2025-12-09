using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IConnectionManagementService
    {
        void AddConnection(int userId, string connectionId);
        void RemoveConnection(int userId);
        string? GetConnectionId(int userId);
    }
}
