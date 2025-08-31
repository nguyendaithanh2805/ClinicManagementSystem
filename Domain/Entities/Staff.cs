using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Staff
    {
        [Key]
        public int Id { get; set; }
        public int SpecialtyId { get; set; }
        public int AccountId { get; set; }
        public string FullName { get; set; } = null!;
        public string Expertise { get; set; } = null!;

        public Account Account { get; set; } = null!;
        public Specialty Specialty { get; set; } = null!;
        public ICollection<ChangeLog> ChangeLogs { get; set; } = null!;
        public ICollection<Appointment> Appointments { get; set; } = null!;
        public ICollection<PatientMedicalRecord> PatientMedicalRecords { get; set; } = null!;
        public ICollection<TestResult> TestResults { get; set; } = null!;
    }
}
