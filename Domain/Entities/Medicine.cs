using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Medicine
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Category { get; set; } = null!;

    public string? Description { get; set; }

    public string Unit { get; set; } = null!;

    public string? Contraindications { get; set; }

    public string? Interactions { get; set; }

    public decimal Price { get; set; }

    public virtual ICollection<PrescriptionDetail> PrescriptionDetails { get; set; } = new List<PrescriptionDetail>();
}
