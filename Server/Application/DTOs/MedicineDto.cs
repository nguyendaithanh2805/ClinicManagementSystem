using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.DTOs
{
    public class MedicineDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;

        public string Category { get; set; } = null!;

        public string? Description { get; set; }

        public string Unit { get; set; } = null!;

        public string? Contraindications { get; set; }

        public string? Interactions { get; set; }

        public decimal Price { get; set; }
    }
}
