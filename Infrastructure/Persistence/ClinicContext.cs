using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence
{
    public class ClinicContext : DbContext
    {
        public ClinicContext(DbContextOptions options) : base(options) { }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<ChangeLog> ChangeLogs { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<MedicalService> MedicalServices { get; set; }
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<PatientMedicalRecord> PatientMedicalRecords { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<PrescriptionDetail> PrescriptionDetails { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Specialty> Specialties { get; set; }
        public DbSet<Staff> Staffs { get; set; }
        public DbSet<Symptom> Symptoms { get; set; }
        public DbSet<TestResult> Results { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // 1. Map tên bảng = tên class
            modelBuilder.Entity<Account>()
            .ToTable("Account")
            .HasKey(a => a.Id);

            modelBuilder.Entity<Appointment>()
                .ToTable("Appointment")
                .HasKey(a => a.Id);

            modelBuilder.Entity<ChangeLog>()
                .ToTable("ChangeLog")
                .HasKey(c => c.Id);

            modelBuilder.Entity<Invoice>()
                .ToTable("Invoice")
                .HasKey(i => i.Id);

            modelBuilder.Entity<MedicalService>()
                .ToTable("MedicalService")
                .HasKey(ms => ms.Id);

            modelBuilder.Entity<Medicine>()
                .ToTable("Medicine")
                .HasKey(m => m.Id);

            modelBuilder.Entity<Patient>()
                .ToTable("Patient")
                .HasKey(p => p.Id);

            modelBuilder.Entity<PatientMedicalRecord>()
                .ToTable("PatientMedicalRecord")
                .HasKey(pmr => pmr.Id);

            modelBuilder.Entity<Prescription>()
                .ToTable("Prescription")
                .HasKey(p => p.Id);

            modelBuilder.Entity<Role>()
                .ToTable("Role")
                .HasKey(r => r.Id);

            modelBuilder.Entity<Specialty>()
                .ToTable("Specialty")
                .HasKey(s => s.Id);

            modelBuilder.Entity<Staff>()
                .ToTable("Staff")
                .HasKey(s => s.Id);

            modelBuilder.Entity<Symptom>()
                .ToTable("Symptom")
                .HasKey(s => s.Id);

            modelBuilder.Entity<TestResult>()
                .ToTable("TestResult")
                .HasKey(tr => tr.Id);


            // 2. Relationships
            modelBuilder.Entity<MedicalService>(entity =>
            {
                entity.Property(ms => ms.Name)
                      .HasMaxLength(100)
                      .IsRequired();

                entity.Property(ms => ms.Cost)
                      .HasColumnType("decimal(15,0)")
                      .IsRequired();

                entity.HasOne(ms => ms.Specialty)
                      .WithMany(s => s.MedicalServices)
                      .HasForeignKey(ms => ms.SpecialtyId);
            });


            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.Property(ap => ap.AppointmentDate)
                      .IsRequired();

                entity.Property(ap => ap.AppointmentTime)
                      .IsRequired();

                entity.Property(ap => ap.Status)
                      .IsRequired();

                // Quan hệ
                entity.HasOne(ap => ap.MedicalService)
                      .WithMany(ms => ms.Appointments)
                      .HasForeignKey(ap => ap.MedicalServiceId);

                entity.HasOne(ap => ap.Patient)
                      .WithMany(pt => pt.Appointments)
                      .HasForeignKey(ap => ap.PatientId);

                entity.HasOne(ap => ap.Staff)
                      .WithMany(s => s.Appointments)
                      .HasForeignKey(ap => ap.StaffId);

                entity.HasOne(ap => ap.Invoice)
                      .WithOne(i => i.Appointment)
                      .HasForeignKey<Invoice>(i => i.Id);
            });

            modelBuilder.Entity<Staff>(entity =>
            {
                entity.Property(s => s.FullName)
                      .HasMaxLength(100)
                      .IsRequired();

                entity.Property(s => s.Expertise)
                      .HasMaxLength(200)
                      .IsRequired();

                // Quan hệ
                entity.HasOne(s => s.Specialty)
                      .WithMany(sp => sp.Staffs)
                      .HasForeignKey(s => s.SpecialtyId);
            });

            modelBuilder.Entity<Account>(entity =>
            {
                entity.Property(a => a.Username)
                      .HasMaxLength(50)
                      .IsRequired();

                entity.Property(a => a.Password)
                      .HasMaxLength(255)
                      .IsRequired();

                entity.Property(a => a.PhoneNumber)
                      .HasMaxLength(15);

                entity.Property(a => a.Email)
                      .HasMaxLength(100);

                // Quan hệ
                entity.HasOne(a => a.Role)
                      .WithMany(r => r.Accounts)
                      .HasForeignKey(a => a.RoleId);

                entity.HasOne(a => a.Staff)
                      .WithOne(s => s.Account)
                      .HasForeignKey<Staff>(s => s.Id);

                entity.HasOne(a => a.Patient)
                      .WithOne(p => p.Account)
                      .HasForeignKey<Patient>(p => p.Id);
            });


            modelBuilder.Entity<ChangeLog>(entity =>
            {
                entity.Property(c => c.TimeStamp)
                      .IsRequired();

                entity.Property(c => c.RelatedTable)
                      .HasMaxLength(100)
                      .IsRequired();

                entity.Property(c => c.Action)
                      .HasMaxLength(50)
                      .IsRequired();

                // Quan hệ
                entity.HasOne(c => c.Staff)
                      .WithMany(s => s.ChangeLogs)
                      .HasForeignKey(c => c.StaffId);
            });

            modelBuilder.Entity<PatientMedicalRecord>(entity =>
            {
                entity.Property(pmr => pmr.Diagnosis)
                      .HasMaxLength(500);

                entity.Property(pmr => pmr.TreatmentMethod)
                      .HasMaxLength(500);

                entity.Property(pmr => pmr.RequiresTest)
                      .IsRequired();

                // Quan hệ
                entity.HasOne(pmr => pmr.Staff)
                      .WithMany(s => s.PatientMedicalRecords)
                      .HasForeignKey(pmr => pmr.StaffId);
            });

            modelBuilder.Entity<TestResult>(entity =>
            {
                entity.Property(t => t.Name)
                      .HasMaxLength(200)
                      .IsRequired();

                entity.Property(t => t.Image)
                      .HasMaxLength(255)
                      .IsRequired();

                entity.Property(t => t.Description)
                      .HasMaxLength(500);

                entity.Property(t => t.CreatedAt)
                      .IsRequired();

                // Quan hệ
                entity.HasOne(t => t.Staff)
                      .WithMany(s => s.TestResults)
                      .HasForeignKey(t => t.StaffId);
            });


            modelBuilder.Entity<Symptom>(entity =>
            {
                entity.Property(st => st.Name)
                      .HasMaxLength(200)
                      .IsRequired();

                // Quan hệ
                entity.HasOne(st => st.PatientMedicalRecord)
                      .WithMany(pmr => pmr.Symptoms)
                      .HasForeignKey(st => st.PatientMedicalRecordId);
            });


            modelBuilder.Entity<PrescriptionDetail>(entity =>
            {
                entity.HasKey(pcd => new { pcd.PrescriptionId, pcd.MedicineId });

                entity.Property(pcd => pcd.Dosage)
                      .HasMaxLength(100);

                entity.Property(pcd => pcd.Frequency)
                      .HasMaxLength(100);

                entity.Property(pcd => pcd.Amount)
                      .HasColumnType("decimal(15,0)");

                entity.HasOne(pcd => pcd.Medicine)
                      .WithMany(m => m.PrescriptionDetails)
                      .HasForeignKey(pcd => pcd.MedicineId);

                entity.HasOne(pcd => pcd.Prescription)
                      .WithMany(p => p.PrescriptionDetails)
                      .HasForeignKey(pcd => pcd.PrescriptionId);
            });


            modelBuilder.Entity<Prescription>(entity =>
            {
                entity.HasOne(p => p.Invoice)
                      .WithOne(i => i.Prescription)
                      .HasForeignKey<Invoice>(i => i.Id);
            });

            // 3. Disable tất cả cascade delete
            foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict; // hoặc DeleteBehavior.NoAction
            }
        }
    }
}
