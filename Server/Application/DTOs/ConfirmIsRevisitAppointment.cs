using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class ConfirmIsRevisitAppointment
    {
        [Required(ErrorMessage = "Ngày hẹn là bắt buộc.")]
        [DataType(DataType.Date, ErrorMessage = "Ngày hẹn phải là ngày hợp lệ.")]
        public DateOnly AppointmentDate { get; set; }

        [Required(ErrorMessage = "Thời gian hẹn là bắt buộc.")]
        [DataType(DataType.Time, ErrorMessage = "Thời gian hẹn phải là thời gian hợp lệ.")]
        public TimeOnly AppointmentTime { get; set; }
    }
}
