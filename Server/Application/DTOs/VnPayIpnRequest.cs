using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class VnPayIpnRequest
    {
        public string VnpSecureHash { get; set; }
        public string VnpTxnRef { get; set; }
        public long VnpAmount { get; set; }
        public string VnpResponseCode { get; set; }
        public string VnpTransactionStatus { get; set; }
        public IDictionary<string, string> RawData { get; set; }
    }
}
