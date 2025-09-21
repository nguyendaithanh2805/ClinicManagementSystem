using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Symptom
{
    public int Id { get; set; }

    public int PatientMedicalRecordId { get; set; }

    public string Name { get; set; } = null!;

    public virtual PatientMedicalRecord PatientMedicalRecord { get; set; } = null!;
}
