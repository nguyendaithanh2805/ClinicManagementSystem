using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class TestResult
    {
        [Key]
        public int Id { get; set; }
        public int PatientMedicalRecordId { get; set; }
        public int StaffId { get; set; }
        public string Name { get; set; } = null!;
        public string Image { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }

        public PatientMedicalRecord PatientMedicalRecord { get; set; } = null!;
        public Staff Staff { get; set; } = null!;
    }
}
