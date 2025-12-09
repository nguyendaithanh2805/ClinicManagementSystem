using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.DTOs
{
    public class InvoiceDto
    {
        public int Id { get; set; }

        public int PatientMedicalRecordId { get; set; }

        public DateTime? PaymentDate { get; set; }
        public decimal TotalAmount { get; set; }

        public bool Status { get; set; }

        public virtual PatientMedicalRecordDto PatientMedicalRecord { get; set; } = null!;
    }
}
