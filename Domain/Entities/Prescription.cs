using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Prescription
    {
        public int Id { get; set; }
        public int PatientMedicalRecordId { get; set; }
        public DateTime PrescriptionDate { get; set; }
        public PatientMedicalRecord PatientMedicalRecord { get; set; } = null!;
        public ICollection<PrescriptionDetail> PrescriptionDetails { get; set; } = null!;
        public Invoice Invoice { get; set; } = null!;
    }
}
