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
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class StaffService : IService<StaffDto>
    {
        private readonly IMapper _mapper;
        private readonly IRepository<Staff> _staffRepository;
        private readonly IUnitOfWork _unitOfWork;

        public StaffService(IMapper mapper, IRepository<Staff> staffRepository, IUnitOfWork unitOfWork)
        {
            _mapper = mapper;
            _staffRepository = staffRepository;
            _unitOfWork = unitOfWork;
        }

        public Task<StaffDto> AddAsync(StaffDto dto)
        {
            throw new NotImplementedException();
        }

        public Task Delete(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<StaffDto>> GetAllAsync()
        {
            return _mapper.Map<IEnumerable<StaffDto>>(
                await _staffRepository.Query()
                .Where(s => s.SpecialtyId != null) // Chỉ lấy những nhân viên đã có chuyên khoa
                .ToListAsync());
        }

        public async Task<StaffDto> GetByIdAsync(int id)
        {
            var staff = await _staffRepository.GetByIdAsync(id);
            if (staff is null)
                throw new NotFoundException($"Không tìm thấy nhân viên với ID {id}");
            return _mapper.Map<StaffDto>(staff);
        }

        public Task<StaffDto> Update(StaffDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
