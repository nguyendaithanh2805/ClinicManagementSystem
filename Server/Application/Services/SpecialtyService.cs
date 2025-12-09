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
    public class SpecialtyService : IService<SpecialtyDto>
    {
        private readonly IRepository<Specialty> _specialtyRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public SpecialtyService(IRepository<Specialty> specialtyRepository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _specialtyRepository = specialtyRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<SpecialtyDto> AddAsync(SpecialtyDto dto)
        {
            await _specialtyRepository.AddAsync(
                _mapper.Map<Specialty>(dto));
            await _unitOfWork.SaveChangeAsync();
            return dto;
        }

        public async Task Delete(int id)
        {
            var specialty = await _specialtyRepository.GetByIdAsync(id);
            if (specialty is null)
                throw new NotFoundException($"Không tìm thấy chuyên khoa với ID {id}");

            _specialtyRepository.Delete(specialty);
            await _unitOfWork.SaveChangeAsync();
        }

        public async Task<IEnumerable<SpecialtyDto>> GetAllAsync()
        {
            return _mapper.Map<IEnumerable<SpecialtyDto>>(await _specialtyRepository.GetAllAsync());
        }

        public async Task<SpecialtyDto> GetByIdAsync(int id)
        {
            var specialty = await _specialtyRepository.GetByIdAsync(id);
            if (specialty is null)
                throw new NotFoundException($"Không tìm thấy chuyên khoa với ID {id}");
            return _mapper.Map<SpecialtyDto>(specialty);
        }

        public async Task<SpecialtyDto> Update(SpecialtyDto dto)
        {
            var specialty = await _specialtyRepository.GetByIdAsync(dto.Id);
            if (specialty is null)
                throw new NotFoundException("Không tìm thấy chuyên khoa, không thể cập nhật.");

            specialty.Id = dto.Id;
            specialty.Name = dto.Name;
            _specialtyRepository.Update(specialty);
            await _unitOfWork.SaveChangeAsync();

            return _mapper.Map<SpecialtyDto>(await _specialtyRepository.GetByIdAsync(dto.Id));
        }
    }
}
