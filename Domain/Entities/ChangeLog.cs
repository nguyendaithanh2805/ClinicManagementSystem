using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class ChangeLog
    {
        public int Id { get; set; }
        public int StaffId { get; set; }
        public int PatientId { get; set; }
        public TimeSpan TimeStamp { get; set; }
        public string RelatedTable { get; set; } = null!;
        public string Action { get; set; } = null!;

        public Staff Staff { get; set; } = null!;
    }
}
