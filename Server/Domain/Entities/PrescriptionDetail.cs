using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class PrescriptionDetail
    {
        public int PrescriptionId { get; set; }
        public int MedicineId { get; set; }
        public int Quantity { get; set; }
        public string? Dosage {  get; set; }
        public string? Frequency { get; set; }
        public decimal Amount { get; set; }
        public Medicine Medicine { get; set; } = null!;
        public Prescription Prescription { get; set; } = null!;
    }
}
