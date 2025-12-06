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
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class StaffService : IStaffService
    {
        private readonly IMapper _mapper;
        private readonly IRepository<Staff> _staffRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRepository<Account> _accountRepository;
        private readonly IPasswordHasher<AccountStaffDto> _passwordHasher;

        public StaffService(IMapper mapper, IRepository<Staff> staffRepository, IUnitOfWork unitOfWork, IRepository<Account> accountRepository, IPasswordHasher<AccountStaffDto> passwordHasher)
        {
            _mapper = mapper;
            _staffRepository = staffRepository;
            _unitOfWork = unitOfWork;
            _accountRepository = accountRepository;
            _passwordHasher = passwordHasher;
        }

        public Task<StaffDto> AddAsync(StaffDto dto)
        {
            throw new NotImplementedException();
        }

        public async Task AddAsync(AccountStaffDto dto)
        {
            try
            {
                await _unitOfWork.BeginTransactionAsync();

                var accountExisting = await _accountRepository.GetAsync(x => x.Username == dto.Username);
                if (accountExisting is not null)
                    throw new AlreadyExistsException("Tên đăng nhập đã tồn tại.");

                var account = new Account
                {
                    RoleId = dto.roleId,
                    Username = dto.Username,
                    Password = _passwordHasher.HashPassword(dto, dto.Password),
                    PhoneNumber = dto.PhoneNumber,
                    Email = dto.Email
                };
                await _accountRepository.AddAsync(account);
                await _unitOfWork.SaveChangeAsync();

                var staff = new Staff
                {
                    AccountId = account.Id,
                    FullName = dto.FullName,
                };
                await _staffRepository.AddAsync(staff);
                await _unitOfWork.CommitAsync();
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
        }

        public async Task AssignStaff(AssignStaffDto dto)
        {
            var staff = await _staffRepository.GetByIdAsync(dto.Id);
            if (staff is null)
                throw new NotFoundException($"Không tìm thấy nhân viên với ID {dto.Id}");

            staff.SpecialtyId = dto.SpecialtyId;
            staff.Expertise = dto.Expertise;
            _staffRepository.Update(staff);
            await _unitOfWork.SaveChangeAsync();
        }

        public async Task Delete(int id)
        {
            var staff = await _staffRepository.GetByIdAsync(id);
            if (staff is null)
                throw new NotFoundException($"Không tìm thấy nhân viên với ID {id}");

            _staffRepository.Delete(staff);
            await _unitOfWork.SaveChangeAsync();
        }

        public async Task<IEnumerable<StaffDto>> GetAllAsync()
        {
            return _mapper.Map<IEnumerable<StaffDto>>(
                await _staffRepository.Query()
                .Where(s => s.SpecialtyId != null && s.Account.RoleId == 3) // Chỉ lấy những bác sĩ đã có chuyên khoa
                .ToListAsync());
        }

        public async Task<IEnumerable<StaffDto>> GetAllReceptionistAsync()
        {
            return _mapper.Map<IEnumerable<StaffDto>>(
                await _staffRepository.Query()
                .Where(s => s.Account.RoleId == 4) // Chỉ lấy tài khoản lễ tân
                .ToListAsync());
        }

        public async Task<IEnumerable<StaffDto>> GetAllStaffAsync()
        {
            return _mapper.Map<IEnumerable<StaffDto>>(
                await _staffRepository.Query()
                .Include(s => s.Account)
                .ToListAsync());
        }

        public async Task<StaffDto> GetByIdAsync(int id)
        {
            var staff = await _staffRepository.GetByIdAsync(id);
            if (staff is null)
                throw new NotFoundException($"Không tìm thấy nhân viên với ID {id}");
            return _mapper.Map<StaffDto>(staff);
        }

        public async Task<StaffDto> Update(StaffDto dto)
        {
            var staff = await _staffRepository.GetByIdAsync(dto.Id);
            if (staff is null)
                throw new NotFoundException("Không tìm thấy bệnh nhân, không thể cập nhật.");
            try
            {
                await _unitOfWork.BeginTransactionAsync();

                staff.FullName = dto.FullName!;
                _staffRepository.Update(staff);

                var account = await _accountRepository.GetByIdAsync(staff.AccountId);
                account.Email = dto.Email;
                account.PhoneNumber = dto.PhoneNumber;
                _accountRepository.Update(account);

                await _unitOfWork.CommitAsync();
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
            return dto;
        }
    }
}
