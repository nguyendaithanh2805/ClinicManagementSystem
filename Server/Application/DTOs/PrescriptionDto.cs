using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.DTOs
{
    public class PrescriptionDto
    {
        public int Id { get; set; }
        public int PatientMedicalRecordId { get; set; }

        public DateTime PrescriptionDate { get; set; }

        public virtual ICollection<PrescriptionDetailDto>? PrescriptionDetails { get; set; }
    }
}
