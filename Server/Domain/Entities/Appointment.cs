using System;
using System.Collections.Generic;
using Domain.Enums;

namespace Domain.Entities;

public partial class Appointment
{
    public int Id { get; set; }

    public int PatientId { get; set; }

    public int? StaffId { get; set; }

    public int MedicalServiceId { get; set; }

    public int? PatientMedicalRecordId { get; set; }

    public DateOnly AppointmentDate { get; set; }

    public TimeOnly AppointmentTime { get; set; }

    public AppointmentStatus Status { get; set; }

    public RevisitStatus Revisit { get; set; }

    public virtual MedicalService MedicalService { get; set; } = null!;

    public virtual Patient Patient { get; set; } = null!;

    public virtual PatientMedicalRecord? PatientMedicalRecord { get; set; }

    public virtual Staff? Staff { get; set; }
    public virtual ICollection<Prescription> Prescriptions { get; set; } = null!;
}
