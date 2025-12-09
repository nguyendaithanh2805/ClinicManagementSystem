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
    public class MedicineService : IService<MedicineDto>
    {
        private readonly IRepository<Medicine> _medicineRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public MedicineService(IRepository<Medicine> medicineRepository, IMapper mapper, IUnitOfWork unitOfWork)
        {
            _medicineRepository = medicineRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<MedicineDto> AddAsync(MedicineDto dto)
        {
            await _medicineRepository.AddAsync(
                _mapper.Map<Medicine>(dto));
            await _unitOfWork.SaveChangeAsync();
            return dto;
        }

        public async Task Delete(int id)
        {
            var medicine = await _medicineRepository.GetByIdAsync(id);
            if (medicine is null)
                throw new NotFoundException("Không tìm thấy thuốc, không thể cập nhật.");

            _medicineRepository.Delete(medicine);
            await _unitOfWork.SaveChangeAsync();
        }

        public async Task<IEnumerable<MedicineDto>> GetAllAsync()
        {
            return _mapper.Map<IEnumerable<MedicineDto>>(await _medicineRepository.GetAllAsync());
        }

        public Task<MedicineDto> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<MedicineDto> Update(MedicineDto dto)
        {
            var medicine = await _medicineRepository.GetByIdAsync(dto.Id);
            if (medicine is null)
                throw new NotFoundException("Không tìm thấy thuốc, không thể cập nhật.");

            medicine.Name = dto.Name;
            medicine.Category = dto.Category;
            medicine.Description = dto.Description;
            medicine.Unit = dto.Unit;
            medicine.Contraindications = dto.Contraindications;
            medicine.Interactions = dto.Interactions;
            medicine.Price = dto.Price;

            _medicineRepository.Update(medicine);
            await _unitOfWork.SaveChangeAsync();
            return dto;
        }
    }
}
