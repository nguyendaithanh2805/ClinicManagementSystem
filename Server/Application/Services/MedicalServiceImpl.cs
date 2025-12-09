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
    public class MedicalServiceImpl : IService<MedicalServiceDto>
    {
        private readonly IRepository<MedicalService> _medicalServiceRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public MedicalServiceImpl(IRepository<MedicalService> medicalServiceRepository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _medicalServiceRepository = medicalServiceRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<MedicalServiceDto> AddAsync(MedicalServiceDto dto)
        {
            await _medicalServiceRepository.AddAsync(
                _mapper.Map<MedicalService>(dto));
            await _unitOfWork.SaveChangeAsync();
            return dto;
        }

        public async Task Delete(int id)
        {
            var medicalService = await _medicalServiceRepository.GetByIdAsync(id);
            if (medicalService is null)
                throw new NotFoundException($"Không tìm thấy dịch vụ y tế với ID {id}");

            _medicalServiceRepository.Delete(medicalService);
            await _unitOfWork.SaveChangeAsync();
        }

        public async Task<IEnumerable<MedicalServiceDto>> GetAllAsync()
        {
            return _mapper.Map<IEnumerable<MedicalServiceDto>>(await _medicalServiceRepository.GetAllAsync());
        }

        public async Task<MedicalServiceDto> GetByIdAsync(int id)
        {
            var medicalService = await _medicalServiceRepository.GetByIdAsync(id);
            if (medicalService is null)
                throw new NotFoundException($"Không tìm thấy dịch vụ y tế với ID {id}");
            return _mapper.Map<MedicalServiceDto>(medicalService);
        }

        public async Task<MedicalServiceDto> Update(MedicalServiceDto dto)
        {
            var medicalService = await _medicalServiceRepository.GetByIdAsync(dto.Id);
            if (medicalService is null)
                throw new NotFoundException("Không tìm thấy dịch vụ  y tế, không thể cập nhật.");

            medicalService.SpecialtyId = dto.SpecialtyId;
            medicalService.Name = dto.Name;
            medicalService.Cost = dto.Cost;

            _medicalServiceRepository.Update(medicalService);
            await _unitOfWork.SaveChangeAsync();

            return _mapper.Map<MedicalServiceDto>(await _medicalServiceRepository.GetByIdAsync(dto.Id));
        }
    }
}
