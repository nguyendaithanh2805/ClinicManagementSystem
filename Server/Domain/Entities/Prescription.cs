using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Prescription
{
    public int Id { get; set; }

    public int PatientMedicalRecordId { get; set; }
    public int AppointmentId { get; set; }
    public DateTime PrescriptionDate { get; set; }
    public bool IsCompleted { get; set; }

    public virtual PatientMedicalRecord PatientMedicalRecord { get; set; } = null!;

    public virtual ICollection<PrescriptionDetail> PrescriptionDetails { get; set; } = new List<PrescriptionDetail>();
    public virtual Appointment Appointment { get; set; } = null!;
}
