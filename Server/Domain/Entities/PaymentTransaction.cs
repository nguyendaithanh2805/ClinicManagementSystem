using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class PaymentTransaction
    {
        public int Id { get; set; }
        public int InvoiceId { get; set; }
        public string TransactionNo { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } // "Pending", "Success", "Failure"
        public DateTime CreatedAt { get; set; }

        public virtual Invoice Invoice { get; set; }
    }
}
