using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class PatientMedicalRecord
{
    public int Id { get; set; }

    public int PatientId { get; set; }

    public int StaffId { get; set; }

    public string? Diagnosis { get; set; }

    public string? TreatmentMethod { get; set; }

    public bool RequiresTest { get; set; }

    public virtual Patient Patient { get; set; } = null!;

    public virtual ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();

    public virtual Staff Staff { get; set; } = null!;

    public virtual ICollection<Symptom> Symptoms { get; set; } = new List<Symptom>();

    public virtual ICollection<TestResult> TestResults { get; set; } = new List<TestResult>();
}
