using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class MedicalService
{
    public int Id { get; set; }

    public int SpecialtyId { get; set; }

    public string Name { get; set; } = null!;

    public decimal Cost { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual Specialty Specialty { get; set; } = null!;
}
