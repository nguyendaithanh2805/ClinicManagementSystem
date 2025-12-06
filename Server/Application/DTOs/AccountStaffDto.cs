using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class AccountStaffDto
    {
        public int roleId { get; set; }
        public string Username { get; set; } = null!;

        public string Password { get; set; } = null!;

        public string? PhoneNumber { get; set; }

        public string? Email { get; set; }
        public string? FullName { get; set; }
    }
}
