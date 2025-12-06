using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class PaymentReturnDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public int InvoiceId { get; set; }
        public string VnpayTransactionId { get; set; }
        public decimal Amount { get; set; }
    }
}
