using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;

namespace Application.Services
{
    public class PatientService : IService<PatientDto>
    {
        private readonly IRepository<Patient> _patientRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public PatientService(IRepository<Patient> patientRepository, IMapper mapper, IUnitOfWork unitOfWork)
        {
            _patientRepository = patientRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<PatientDto> AddAsync(PatientDto dto)
        {
            dto.FullName = "Bệnh nhân chưa có tên";

            await _patientRepository.AddAsync(
                _mapper.Map<Patient>(dto));
            return dto;
        }

        public Task Delete(int id)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<PatientDto>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<PatientDto> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<PatientDto> Update(PatientDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
