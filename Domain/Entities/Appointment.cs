using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Appointment
{
    public int Id { get; set; }

    public int PatientId { get; set; }

    public int? StaffId { get; set; }

    public int MedicalServiceId { get; set; }

    public DateOnly AppointmentDate { get; set; }

    public TimeOnly AppointmentTime { get; set; }

    public int Status { get; set; }

    public virtual Invoice? Invoice { get; set; }

    public virtual MedicalService MedicalService { get; set; } = null!;

    public virtual Patient Patient { get; set; } = null!;

    public virtual Staff? Staff { get; set; }
}
