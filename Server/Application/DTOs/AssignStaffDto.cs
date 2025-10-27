using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class AssignStaffDto
    {
        public int Id { get; set; }
        public int? SpecialtyId { get; set; }
        public string? Expertise { get; set; }
    }
}
