using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;
using AutoMapper;
using Domain.Entities;

namespace Application.Mappings
{
    public class MapperProfile : Profile
    {
        public MapperProfile()
        {
            CreateMap<Account, AccountDto>().ReverseMap();
            CreateMap<Appointment, AppointmentDto>().ReverseMap();
            CreateMap<Appointment, AppointmentWithPatientDto>();

            CreateMap<Patient, PatientDto>().ReverseMap();
            CreateMap<PatientWithAccountDto, Patient>().ReverseMap();
            CreateMap<Prescription, PrescriptionDto>().ReverseMap();
            CreateMap<PrescriptionDetail, PrescriptionDetailDto>().ReverseMap();
            CreateMap<PatientMedicalRecord, PatientMedicalRecordDto>().ReverseMap();

            CreateMap<Staff, StaffDto>().ReverseMap();
            CreateMap<Specialty, SpecialtyDto>().ReverseMap();

            CreateMap<Role, RoleDto>().ReverseMap();

            CreateMap<MedicalService, MedicalServiceDto>().ReverseMap();
            CreateMap<Medicine, MedicineDto>().ReverseMap();

            CreateMap<Invoice, InvoiceDto>().ReverseMap();

            CreateMap<Symptom, SymptomDto>().ReverseMap();

            CreateMap<TestResult, TestResultDto>().ReverseMap();
        }
    }
}
