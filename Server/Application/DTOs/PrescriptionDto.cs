using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class PrescriptionDto
    {
        [Required(ErrorMessage = "PatientMedicalRecordId là bắt buộc.")]
        public int PatientMedicalRecordId { get; set; }

        [Required(ErrorMessage = "Ngày kê đơn là bắt buộc.")]
        public DateTime PrescriptionDate { get; set; }
    }
}
