using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Enums;

namespace Application.DTOs
{
    public class AppointmentWithPatientDto
    {
        public int Id { get; set; }
        public int MedicalServiceId { get; set; }
        public DateOnly AppointmentDate { get; set; }
        public TimeOnly AppointmentTime { get; set; }
        public AppointmentStatus Status { get; set; }
        public MedicalServiceDto? MedicalService { get; set; }
    }
}
