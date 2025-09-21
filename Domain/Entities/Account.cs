using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Account
{
    public int Id { get; set; }

    public int RoleId { get; set; }

    public string Username { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string? PhoneNumber { get; set; }

    public string? Email { get; set; }

    public virtual Patient? Patient { get; set; }

    public virtual Role Role { get; set; } = null!;

    public virtual Staff? Staff { get; set; }
}
