using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Symptom
    {
        public int Id { get; set; }
        public int PatientMedicalRecordId { get; set; }
        public string Name { get; set; } = null!;

        public PatientMedicalRecord PatientMedicalRecord { get; set; } = null!;
    }
}
