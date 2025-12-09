using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class PatientWithAccountDto
    {
        public int Id { get; set; }
        public int AccountId { get; set; }

        [StringLength(50, ErrorMessage = "Username không được vượt quá 50 ký tự.")]
        public string? Username { get; set; }

        [MinLength(6, ErrorMessage = "Password phải có ít nhất 6 ký tự.")]
        [MaxLength(100, ErrorMessage = "Password không được vượt quá 100 ký tự.")]
        public string? Password { get; set; }

        [StringLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự.")]
        public string? FullName { get; set; }

        [DataType(DataType.Date)]
        public DateOnly? DateOfBirth { get; set; }

        [StringLength(200, ErrorMessage = "Địa chỉ không được vượt quá 200 ký tự.")]
        public string? Address { get; set; }

        [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
        [StringLength(15, ErrorMessage = "Số điện thoại không được quá 15 ký tự.")]
        [RegularExpression(@"^\d{9,15}$", ErrorMessage = "Số điện thoại phải chứa từ 9 đến 15 chữ số.")]
        public string? PhoneNumber { get; set; }

        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        [StringLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự.")]

        public string? Email { get; set; }
    }
}
