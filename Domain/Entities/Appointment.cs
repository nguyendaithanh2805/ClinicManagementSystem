using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Appointment
    {
        [Key]
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int StaffId { get; set; }
        public int MedicalServiceId { get; set; }
        public DateOnly AppointmentDate { get; set; }
        public TimeSpan AppointmentTime { get; set; }
        public bool Status { get; set; }

        public MedicalService MedicalService { get; set; } = null!;
        public Staff Staff { get; set; } = null!;
        public Patient Patient { get; set; } = null!;
        public Invoice Invoice { get; set; } = null!;
    }
}
