using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class MedicalService
    {
        [Key]
        public int Id { get; set; }
        public int SpecialtyId { get; set; }
        public string Name { get; set; } = null!;
        public decimal Cost { get; set; }
        public Specialty Specialty { get; set; } = null!;
        public ICollection<Appointment> Appointments { get; set; } = null!;
    }
}
