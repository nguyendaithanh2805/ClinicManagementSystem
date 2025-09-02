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
            CreateMap<Patient, PatientDto>().ReverseMap();
            CreateMap<PatientDto, AccountDto>().ReverseMap();
        }
    }
}
