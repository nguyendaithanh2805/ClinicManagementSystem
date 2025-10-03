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
    public class MedicineService : IService<MedicineDto>
    {
        private readonly IRepository<Medicine> _medicineRepository;
        private readonly IMapper _mapper;

        public MedicineService(IRepository<Medicine> medicineRepository, IMapper mapper)
        {
            _medicineRepository = medicineRepository;
            _mapper = mapper;
        }

        public Task<MedicineDto> AddAsync(MedicineDto dto)
        {
            throw new NotImplementedException();
        }

        public Task Delete(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<MedicineDto>> GetAllAsync()
        {
            return _mapper.Map<IEnumerable<MedicineDto>>(await _medicineRepository.GetAllAsync());
        }

        public Task<MedicineDto> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<MedicineDto> Update(MedicineDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
