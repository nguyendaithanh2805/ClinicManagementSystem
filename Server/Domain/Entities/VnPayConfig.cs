using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class VnPayConfig
    {
        public string VnpUrl { get; set; }
        public string TmnCode { get; set; }
        public string HashSecret { get; set; }
        public string ReturnUrl { get; set; }
        public string IpnUrl { get; set; }
    }
}
