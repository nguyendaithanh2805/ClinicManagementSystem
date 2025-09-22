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

            CreateMap<Patient, PatientDto>().ReverseMap();
            CreateMap<PatientWithAccountDto, Patient>().ReverseMap();

            CreateMap<Staff, StaffDto>().ReverseMap();
            CreateMap<Specialty, SpecialtyDto>().ReverseMap();

            CreateMap<Role, RoleDto>().ReverseMap();

            CreateMap<MedicalService, MedicalServiceDto>().ReverseMap();
        }
    }
}
