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

        public int AppointmentId { get; set; }

        public int? PrescriptionId { get; set; }

        public DateTime? PaymentDate { get; set; }
        public DateTime? PaymentDateVN =>
        PaymentDate.HasValue
            ? TimeZoneInfo.ConvertTimeFromUtc(PaymentDate.Value,
                TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"))
            : null;
        public decimal TotalAmount { get; set; }

        public bool Status { get; set; }

        public virtual AppointmentDto? Appointment { get; set; }

        public virtual PrescriptionDto? Prescription { get; set; }
    }
}
