using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Domain.Entities;

public partial class Invoice
{
    public int Id { get; set; }

    public int PatientMedicalRecordId { get; set; }

    public DateTime? PaymentDate { get; set; }

    public decimal TotalAmount { get; set; }

    public bool Status { get; set; }

    public virtual PatientMedicalRecord PatientMedicalRecord { get; set; } = null!;
}
