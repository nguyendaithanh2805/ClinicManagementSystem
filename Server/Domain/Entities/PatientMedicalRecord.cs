using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class PatientMedicalRecord
    {
        [Key]
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int StaffId { get; set; }
        public string? Diagnosis { get; set; }
        public string? TreatmentMethod { get; set; }
        public bool RequiresTest { get; set; }
        public Patient Patient { get; set; } = null!;
        public Staff Staff { get; set; } = null!;
        public ICollection<TestResult> TestResults { get; set; } = null!;
        public ICollection<Symptom> Symptoms { get; set; } = null!;
        public ICollection<Prescription> Prescriptions { get; set; } = null!;
    }
}
