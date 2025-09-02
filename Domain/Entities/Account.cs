using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Account
    {
        [Key]
        public int Id { get; set; }
        public int RoleId { get; set; }
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }

        public Role Role { get; set; } = null!;
        public Staff Staff { get; set; } = null!;
        public Patient Patient { get; set; } = null!;
    }
}
