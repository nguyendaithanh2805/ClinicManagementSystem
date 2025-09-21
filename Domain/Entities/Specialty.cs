using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Specialty
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<MedicalService> MedicalServices { get; set; } = new List<MedicalService>();

    public virtual ICollection<Staff> Staff { get; set; } = new List<Staff>();
}
