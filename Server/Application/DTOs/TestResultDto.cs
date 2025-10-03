using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.DTOs
{
    public class TestResultDto
    {
        public int Id { get; set; }

        public int PatientMedicalRecordId { get; set; }

        public int StaffId { get; set; }

        public string Name { get; set; } = null!;

        public string? Image { get; set; }

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; }
        public virtual StaffDto? Staff { get; set; }
    }
}
