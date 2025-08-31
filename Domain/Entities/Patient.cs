using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Patient
    {
        [Key]
        public int Id { get; set; }
        public string FullName { get; set; } = null!;
        public DateOnly? DateOfBirth { get; set; }
        public string? Address { get; set; }

        public Account Account { get; set; } = null!;
        public ICollection<Appointment> Appointments { get; set; } = null!;
        public ICollection<PatientMedicalRecord> PatientMedicalRecords { get; set; } = null!;
    }
}
