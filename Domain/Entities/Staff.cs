using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Staff
{
    public int Id { get; set; }

    public int AccountId { get; set; }

    public int? SpecialtyId { get; set; }

    public string? FullName { get; set; }

    public string? Expertise { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual ICollection<PatientMedicalRecord> PatientMedicalRecords { get; set; } = new List<PatientMedicalRecord>();

    public virtual Specialty? Specialty { get; set; }

    public virtual ICollection<TestResult> TestResults { get; set; } = new List<TestResult>();
}
