using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Patient
{
    public int Id { get; set; }

    public int AccountId { get; set; }

    public string FullName { get; set; } = null!;

    public DateOnly? DateOfBirth { get; set; }

    public string? Address { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual ICollection<PatientMedicalRecord> PatientMedicalRecords { get; set; } = new List<PatientMedicalRecord>();
}
