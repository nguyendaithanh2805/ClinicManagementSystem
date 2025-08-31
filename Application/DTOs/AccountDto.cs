using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class AccountDto
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "RoleId là bắt buộc.")]
        public int RoleId { get; set; }

        [Required(ErrorMessage = "Username là bắt buộc.")]
        [StringLength(50, ErrorMessage = "Username không được vượt quá 50 ký tự.")]
        public string Username { get; set; } = null!;

        [Required(ErrorMessage = "Password là bắt buộc.")]
        [MinLength(6, ErrorMessage = "Password phải có ít nhất 6 ký tự.")]
        [MaxLength(100, ErrorMessage = "Password không được vượt quá 100 ký tự.")]
        public string Password { get; set; } = null!;

        [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
        [StringLength(15, ErrorMessage = "Số điện thoại không được quá 15 ký tự.")]
        public string PhoneNumber { get; set; } = null!;

        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        [StringLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự.")]
        public string? Email { get; set; }
    }
}
