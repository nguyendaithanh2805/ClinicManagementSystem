using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class MedicalServiceDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "SpecialtyId là bắt buộc.")]
        [Range(1, int.MaxValue, ErrorMessage = "SpecialtyId phải lớn hơn 0.")]
        public int SpecialtyId { get; set; }

        [Required(ErrorMessage = "Tên dịch vụ là bắt buộc.")]
        [StringLength(100, ErrorMessage = "Tên dịch vụ không được vượt quá 100 ký tự.")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "Chi phí là bắt buộc.")]
        [Range(0, 100000000, ErrorMessage = "Chi phí phải nằm trong khoảng từ 0 đến 100,000,000.")]
        public decimal Cost { get; set; }
    }
}
