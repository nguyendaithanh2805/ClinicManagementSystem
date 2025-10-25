using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using Domain.Entities;
    using Domain.Enums;

    public class AppointmentDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "PatientId là bắt buộc.")]
        public int PatientId { get; set; }

        public int? StaffId { get; set; }

        [Required(ErrorMessage = "MedicalServiceId là bắt buộc.")]
        public int MedicalServiceId { get; set; }
        public int? PatientMedicalRecordId { get; set; }

        [Required(ErrorMessage = "Ngày hẹn là bắt buộc.")]
        [DataType(DataType.Date, ErrorMessage = "Ngày hẹn phải là ngày hợp lệ.")]
        public DateOnly AppointmentDate { get; set; }

        [Required(ErrorMessage = "Thời gian hẹn là bắt buộc.")]
        [DataType(DataType.Time, ErrorMessage = "Thời gian hẹn phải là thời gian hợp lệ.")]
        public TimeOnly AppointmentTime { get; set; }

        [Required(ErrorMessage = "Trạng thái là bắt buộc.")]
        public AppointmentStatus Status { get; set; }
        public RevisitStatus Revisit { get; set; }
        public string? FullName { get; set; }
        public string? phoneNumber { get; set; }
        public PatientDto? Patient { get; set; }
        public StaffDto? Staff { get; set; }
        public MedicalServiceDto? MedicalService { get; set; }
        public virtual ICollection<PrescriptionDto>? Prescriptions { get; set; }
        //public virtual PatientMedicalRecordDto? PatientMedicalRecord { get; set; }

    }

}
