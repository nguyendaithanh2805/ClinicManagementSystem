using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class TestResult
{
    public int Id { get; set; }

    public int PatientMedicalRecordId { get; set; }

    public int StaffId { get; set; }

    public string Name { get; set; } = null!;

    public string Image { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual PatientMedicalRecord PatientMedicalRecord { get; set; } = null!;

    public virtual Staff Staff { get; set; } = null!;
}
