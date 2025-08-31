using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Invoice
    {
        [Key]
        public int Id { get; set; }
        public DateTime PaymentDate { get; set; }
        public decimal TotalAmount { get; set; }
        public bool Status { get; set; }

        public Prescription Prescription { get; set; } = null!;
        public Appointment Appointment { get; set; } = null!;
    }
}
