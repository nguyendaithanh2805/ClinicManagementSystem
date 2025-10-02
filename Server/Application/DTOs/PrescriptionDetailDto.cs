using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.DTOs
{
    public class PrescriptionDetailDto
    {
        public int PrescriptionId { get; set; }
        public int MedicineId { get; set; }
        public int? PatientMedicalRecordId { get; set; }

        [Required(ErrorMessage = "Quantity là bắt buộc.")]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity phải lớn hơn 0.")]
        public int Quantity { get; set; }

        [StringLength(100, ErrorMessage = "Liều lượng không được vượt quá 100 ký tự.")]
        public string? Dosage { get; set; }

        [StringLength(100, ErrorMessage = "Tần suất không được vượt quá 100 ký tự.")]
        public string? Frequency { get; set; }

        public decimal Amount { get; set; }
        public virtual MedicineDto? Medicine { get; set; }
    }
}
