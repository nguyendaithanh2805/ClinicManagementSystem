using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class PatientMedicalRecordDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "PatientId là bắt buộc.")]
        [Range(1, int.MaxValue, ErrorMessage = "PatientId phải lớn hơn 0.")]
        public int PatientId { get; set; }

        [Required(ErrorMessage = "StaffId là bắt buộc.")]
        [Range(1, int.MaxValue, ErrorMessage = "StaffId phải lớn hơn 0.")]
        public int StaffId { get; set; }

        [StringLength(500, ErrorMessage = "Chẩn đoán không được vượt quá 500 ký tự.")]
        public string? Diagnosis { get; set; }

        [StringLength(500, ErrorMessage = "Phương pháp điều trị không được vượt quá 500 ký tự.")]
        public string? TreatmentMethod { get; set; }

        [Required(ErrorMessage = "Yêu cầu xét nghiệm là bắt buộc.")]
        public bool RequiresTest { get; set; }
    }
}
