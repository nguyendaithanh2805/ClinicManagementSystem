using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Invoice
{
    public int Id { get; set; }

    public int AppointmentId { get; set; }

    public int? PrescriptionId { get; set; }

    public DateTime? PaymentDate { get; set; }

    public decimal TotalAmount { get; set; }

    public bool Status { get; set; }

    public virtual Appointment Appointment { get; set; } = null!;

    public virtual Prescription? Prescription { get; set; }
}
