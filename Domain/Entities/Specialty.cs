using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Specialty
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public ICollection<MedicalService>? MedicalServices { get; set; }
        public ICollection<Staff>? Staffs { get; set; }
    }
}
