using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.DTOs
{
    public class PatientMedicalRecordDto
    {
        public int Id { get; set; }

        public int PatientId { get; set; }

        public int StaffId { get; set; }

        [StringLength(500, ErrorMessage = "Chẩn đoán không được vượt quá 500 ký tự.")]
        public string? Diagnosis { get; set; }

        [StringLength(500, ErrorMessage = "Phương pháp điều trị không được vượt quá 500 ký tự.")]
        public string? TreatmentMethod { get; set; }

        public bool RequiresTest { get; set; }
        public DateTime CreateAt { get; set; }
        public bool Status { get; set; }
        public virtual PatientDto? Patient { get; set; }

        public virtual ICollection<PrescriptionDto>? Prescriptions { get; set; }

        public virtual StaffDto? Staff { get; set; }

        public virtual ICollection<SymptomDto>? Symptoms { get; set; }

        public virtual ICollection<TestResultDto>? TestResults { get; set; }
        //public virtual InvoiceDto? InvoiceDto { get; set; }
        public virtual ICollection<AppointmentDto>? Appointments { get; set; }
    }
}
