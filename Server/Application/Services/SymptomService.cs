using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;

namespace Application.Services
{
    public class SymptomService : ISymptomService
    {
        private readonly IRepository<Symptom> _symptomRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public SymptomService(IRepository<Symptom> symptomRepository, IMapper mapper, IUnitOfWork unitOfWork)
        {
            _symptomRepository = symptomRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<SymptomDto> AddAsync(SymptomDto dto)
        {
            await _symptomRepository.AddAsync(_mapper.Map<Symptom>(dto));
            await _unitOfWork.SaveChangeAsync();
            return dto;
        }

        public async Task Delete(int id)
        {
            var symptom = await _symptomRepository.GetByIdAsync(id);
            if (symptom is null)
                throw new NotFoundException($"Không tìm thấy triệu chứng với ID {id}");
            
            _symptomRepository.Delete(symptom);
            await _unitOfWork.SaveChangeAsync();
        }

        public Task<IEnumerable<SymptomDto>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<SymptomDto>> GetAllByMedicalRecordAsync(int patientMedicalRecordId)
        {
            return _mapper.Map<IEnumerable<SymptomDto>>(
                await _symptomRepository.GetAllAsync(s => s.PatientMedicalRecordId == patientMedicalRecordId));
        }

        public Task<SymptomDto> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<SymptomDto> Update(SymptomDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
