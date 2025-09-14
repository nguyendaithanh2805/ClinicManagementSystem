using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using Domain.Enums;

    public class AppointmentDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "PatientId là bắt buộc.")]
        public int PatientId { get; set; }

        public int? StaffId { get; set; }

        [Required(ErrorMessage = "MedicalServiceId là bắt buộc.")]
        public int MedicalServiceId { get; set; }

        [Required(ErrorMessage = "Ngày hẹn là bắt buộc.")]
        [DataType(DataType.Date, ErrorMessage = "Ngày hẹn phải là ngày hợp lệ.")]
        public DateOnly AppointmentDate { get; set; }

        [Required(ErrorMessage = "Thời gian hẹn là bắt buộc.")]
        [DataType(DataType.Time, ErrorMessage = "Thời gian hẹn phải là thời gian hợp lệ.")]
        public TimeSpan AppointmentTime { get; set; }

        [Required(ErrorMessage = "Trạng thái là bắt buộc.")]
        public AppointmentStatus Status { get; set; }
    }

}
