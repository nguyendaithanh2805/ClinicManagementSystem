using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class SymptomDto
    {
        public int Id { get; set; }

        public int PatientMedicalRecordId { get; set; }

        public string Name { get; set; } = null!;
    }
}
