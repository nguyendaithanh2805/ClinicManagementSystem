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

            modelBuilder.Entity<Account>().ToTable("Account");
            modelBuilder.Entity<Appointment>().ToTable("Appointment");
            modelBuilder.Entity<ChangeLog>().ToTable("ChangeLog");
            modelBuilder.Entity<Invoice>().ToTable("Invoice");
            modelBuilder.Entity<MedicalService>().ToTable("MedicalService");
            modelBuilder.Entity<Medicine>().ToTable("Medicine");
            modelBuilder.Entity<Patient>().ToTable("Patient");
            modelBuilder.Entity<PatientMedicalRecord>().ToTable("PatientMedicalRecord");
            modelBuilder.Entity<Prescription>().ToTable("Prescription");
            modelBuilder.Entity<PrescriptionDetail>().ToTable("PrescriptionDetail");
            modelBuilder.Entity<Role>().ToTable("Role");
            modelBuilder.Entity<Specialty>().ToTable("Specialty");
            modelBuilder.Entity<Staff>().ToTable("Staff");
            modelBuilder.Entity<Symptom>().ToTable("Symptom");
            modelBuilder.Entity<TestResult>().ToTable("TestResult");

            // 2. composite key
            modelBuilder.Entity<PrescriptionDetail>()
                .HasKey(pd => new { pd.PrescriptionId, pd.MedicineId });

            // 3. Relationships
            modelBuilder.Entity<MedicalService>()
                .HasOne(ms => ms.Specialty)
                .WithMany(s => s.MedicalServices)
                .HasForeignKey(ms => ms.SpecialtyId);

            modelBuilder.Entity<Appointment>()
                .HasOne(ap => ap.MedicalService)
                .WithMany(ms => ms.Appointments)
                .HasForeignKey(ap => ap.MedicalServiceId);

            modelBuilder.Entity<Appointment>()
                .HasOne(ap => ap.Patient)
                .WithMany(pt => pt.Appointments)
                .HasForeignKey(ap => ap.PatientId);

            modelBuilder.Entity<Appointment>()
                .HasOne(ap => ap.Staff)
                .WithMany(s => s.Appointments)
                .HasForeignKey(ap => ap.StaffId);

            modelBuilder.Entity<Appointment>()
                .HasOne(ap => ap.Invoice)
                .WithOne(i => i.Appointment)
                .HasForeignKey<Invoice>(i => i.Id);

            modelBuilder.Entity<Staff>()
                .HasOne(s => s.Specialty)
                .WithMany(sp => sp.Staffs)
                .HasForeignKey(s => s.SpecialtyId);

            modelBuilder.Entity<Account>()
                .HasOne(a => a.Staff)
                .WithOne(s => s.Account)
                .HasForeignKey<Staff>(s => s.Id);

            modelBuilder.Entity<Account>()
                .HasOne(a => a.Patient)
                .WithOne(p => p.Account)
                .HasForeignKey<Patient>(p => p.Id);

            modelBuilder.Entity<Account>()
                .HasOne(a => a.Role)
                .WithMany(r => r.Accounts)
                .HasForeignKey(a => a.RoleId);


            modelBuilder.Entity<ChangeLog>()
                .HasOne(c => c.Staff)
                .WithMany(s => s.ChangeLogs)
                .HasForeignKey(c => c.StaffId);
            
            modelBuilder.Entity<PatientMedicalRecord>()
                .HasOne(pmr => pmr.Staff)
                .WithMany(s => s.PatientMedicalRecords)
                .HasForeignKey(pmr => pmr.StaffId);

            modelBuilder.Entity<TestResult>()
                .HasOne(t => t.Staff)
                .WithMany(s => s.TestResults)
                .HasForeignKey(t => t.StaffId);

            modelBuilder.Entity<Symptom>()
                .HasOne(st => st.PatientMedicalRecord)
                .WithMany(pmr => pmr.Symptoms)
                .HasForeignKey(st => st.PatientMedicalRecordId);

            modelBuilder.Entity<PrescriptionDetail>()
                .HasOne(pcd => pcd.Medicine)
                .WithMany(m => m.PrescriptionDetails)
                .HasForeignKey(pcd => pcd.MedicineId);

            modelBuilder.Entity<PrescriptionDetail>()
                .HasOne(pcd => pcd.Prescription)
                .WithMany(p => p.PrescriptionDetails)
                .HasForeignKey(pcd => pcd.PrescriptionId);

            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Prescription)
                .WithOne(p => p.Invoice)
                .HasForeignKey<Prescription>(p => p.Id);

            // 4. Disable tất cả cascade delete
            foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict; // hoặc DeleteBehavior.NoAction
            }
        }
    }
}
