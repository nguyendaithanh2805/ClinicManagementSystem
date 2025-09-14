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
    public class RoleService : IService<RoleDto>
    {
        private readonly IRepository<Role> _roleRepository;
        private readonly IMapper _mapper;

        public RoleService(IRepository<Role> roleRepository, IMapper mapper)
        {
            _roleRepository = roleRepository;
            _mapper = mapper;
        }

        public Task<RoleDto> AddAsync(RoleDto dto)
        {
            throw new NotImplementedException();
        }

        public Task Delete(int id)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<RoleDto>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<RoleDto> GetByIdAsync(int id)
        {
            var role = await _roleRepository.GetByIdAsync(id);
            if (role is null)
                throw new NotFoundException($"Không tìm thấy vai trò với ID {id}");
            return _mapper.Map<RoleDto>(role);
        }

        public Task<RoleDto> Update(RoleDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
