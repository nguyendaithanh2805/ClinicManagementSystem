using System;
using System.Collections.Generic;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

public partial class ClinicContext : DbContext
{
    public ClinicContext(DbContextOptions<ClinicContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Account> Accounts { get; set; }

    public virtual DbSet<Appointment> Appointments { get; set; }

    public virtual DbSet<Invoice> Invoices { get; set; }

    public virtual DbSet<MedicalService> MedicalServices { get; set; }

    public virtual DbSet<Medicine> Medicines { get; set; }

    public virtual DbSet<Patient> Patients { get; set; }

    public virtual DbSet<PatientMedicalRecord> PatientMedicalRecords { get; set; }

    public virtual DbSet<Prescription> Prescriptions { get; set; }

    public virtual DbSet<PrescriptionDetail> PrescriptionDetails { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Specialty> Specialties { get; set; }

    public virtual DbSet<Staff> Staff { get; set; }

    public virtual DbSet<Symptom> Symptoms { get; set; }

    public virtual DbSet<TestResult> TestResults { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.ToTable("Account");

            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Password).HasMaxLength(200);
            entity.Property(e => e.PhoneNumber).HasMaxLength(50);
            entity.Property(e => e.Username).HasMaxLength(200);

            entity.HasOne(d => d.Role).WithMany(p => p.Accounts)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Account_Role");
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.ToTable("Appointment");

            entity.HasOne(d => d.MedicalService).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.MedicalServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Appointment_MedicalService");

            entity.HasOne(d => d.Patient).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.PatientId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Appointment_Patient");

            entity.HasOne(d => d.PatientMedicalRecord).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.PatientMedicalRecordId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Appointment_PatientMedicalRecord");

            entity.HasOne(d => d.Staff).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.StaffId)
                .HasConstraintName("FK_Appointment_Staff");
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.ToTable("Invoice");

            entity.Property(e => e.PaymentDate).HasColumnType("datetime");
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(15, 0)");

            entity.HasOne(d => d.PatientMedicalRecord).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.PatientMedicalRecordId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Invoice_PatientMedicalRecord");
        });

        modelBuilder.Entity<MedicalService>(entity =>
        {
            entity.ToTable("MedicalService");

            entity.Property(e => e.Cost).HasColumnType("decimal(15, 0)");
            entity.Property(e => e.Name).HasMaxLength(200);

            entity.HasOne(d => d.Specialty).WithMany(p => p.MedicalServices)
                .HasForeignKey(d => d.SpecialtyId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_MedicalService_Specialty");
        });

        modelBuilder.Entity<Medicine>(entity =>
        {
            entity.ToTable("Medicine");

            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.Contraindications).HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Interactions).HasMaxLength(500);
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Unit).HasMaxLength(50);
        });

        modelBuilder.Entity<Patient>(entity =>
        {
            entity.ToTable("Patient");

            entity.HasIndex(e => e.AccountId, "UQ__Patient__349DA5A73FEB7BCB").IsUnique();

            entity.Property(e => e.Address).HasMaxLength(300);
            entity.Property(e => e.FullName).HasMaxLength(200);

            entity.HasOne(d => d.Account).WithOne(p => p.Patient)
                .HasForeignKey<Patient>(d => d.AccountId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Patient_Account");
        });

        modelBuilder.Entity<PatientMedicalRecord>(entity =>
        {
            entity.ToTable("PatientMedicalRecord");

            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.Diagnosis).HasMaxLength(500);
            entity.Property(e => e.TreatmentMethod).HasMaxLength(500);

            entity.HasOne(d => d.Patient).WithMany(p => p.PatientMedicalRecords)
                .HasForeignKey(d => d.PatientId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_PatientMedicalRecord_Patient");

            entity.HasOne(d => d.Staff).WithMany(p => p.PatientMedicalRecords)
                .HasForeignKey(d => d.StaffId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PatientMedicalRecord_Staff");
        });

        modelBuilder.Entity<Prescription>(entity =>
        {
            entity.ToTable("Prescription");

            entity.Property(e => e.PrescriptionDate).HasColumnType("datetime");

            entity.HasOne(d => d.PatientMedicalRecord).WithMany(p => p.Prescriptions)
                .HasForeignKey(d => d.PatientMedicalRecordId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Prescription_PatientMedicalRecord");

            entity.HasOne(d => d.Appointment).WithMany(p => p.Prescriptions)
                .HasForeignKey(d => d.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Prescription_Appointment");
        });

        modelBuilder.Entity<PrescriptionDetail>(entity =>
        {
            entity.ToTable("PrescriptionDetail");

            entity.Property(e => e.Amount).HasColumnType("decimal(15, 0)");
            entity.Property(e => e.Dosage).HasMaxLength(200);
            entity.Property(e => e.Frequency).HasMaxLength(200);

            entity.HasOne(d => d.Medicine).WithMany(p => p.PrescriptionDetails)
                .HasForeignKey(d => d.MedicineId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_PrescriptionDetail_Medicine");

            entity.HasOne(d => d.Prescription).WithMany(p => p.PrescriptionDetails)
                .HasForeignKey(d => d.PrescriptionId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_PrescriptionDetail_Prescription");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("Role");

            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Specialty>(entity =>
        {
            entity.ToTable("Specialty");

            entity.Property(e => e.Name).HasMaxLength(200);
        });

        modelBuilder.Entity<Staff>(entity =>
        {
            entity.HasIndex(e => e.AccountId, "UQ__Staff__349DA5A70973221B").IsUnique();

            entity.Property(e => e.Expertise).HasMaxLength(200);
            entity.Property(e => e.FullName).HasMaxLength(200);

            entity.HasOne(d => d.Account).WithOne(p => p.Staff)
                .HasForeignKey<Staff>(d => d.AccountId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Staff_Account");

            entity.HasOne(d => d.Specialty).WithMany(p => p.Staff)
                .HasForeignKey(d => d.SpecialtyId)
                .HasConstraintName("FK_Staff_Specialty");
        });

        modelBuilder.Entity<Symptom>(entity =>
        {
            entity.ToTable("Symptom");

            entity.Property(e => e.Name).HasMaxLength(200);

            entity.HasOne(d => d.PatientMedicalRecord).WithMany(p => p.Symptoms)
                .HasForeignKey(d => d.PatientMedicalRecordId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Symptom_PatientMedicalRecord");
        });

        modelBuilder.Entity<TestResult>(entity =>
        {
            entity.ToTable("TestResult");

            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Image).HasMaxLength(300);
            entity.Property(e => e.Name).HasMaxLength(200);

            entity.HasOne(d => d.PatientMedicalRecord).WithMany(p => p.TestResults)
                .HasForeignKey(d => d.PatientMedicalRecordId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_TestResult_PatientMedicalRecord");

            entity.HasOne(d => d.Staff).WithMany(p => p.TestResults)
                .HasForeignKey(d => d.StaffId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TestResult_Staff");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
