using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using Application.Mappings;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IRepository<Account> _accountRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IPasswordHasher<AccountDto> _passwordHasher;
        private readonly IService<PatientDto> _patientService;

        public AuthService(IRepository<Account> accountRepository, IMapper mapper, IUnitOfWork unitOfWork, IJwtTokenGenerator jwtTokenGenerator, IPasswordHasher<AccountDto> passwordHasher, IService<PatientDto> patientService)
        {
            _accountRepository = accountRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _jwtTokenGenerator = jwtTokenGenerator;
            _passwordHasher = passwordHasher;
            _patientService = patientService;
        }

        public async Task<AccountDto> AddAsync(AccountDto dto)
        {
            var account = await _accountRepository.GetAsync(x => x.Username == dto.Username);
            if (account is not null)
                throw new AlreadyExistsException("Tên đăng nhập đã tồn tại.");
            if (dto.RoleId == 0)
                dto.RoleId = 3; // patient
            dto.Password = _passwordHasher.HashPassword(dto, dto.Password);
            
            try
            {
                await _unitOfWork.BeginTransactionAsync();

                //await _accountRepository.AddAsync(
                //    _mapper.Map<Account>(dto));
            
                await _patientService.AddAsync(
                    _mapper.Map<PatientDto>(dto));

                await _unitOfWork.CommitAsync();
                return dto;
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            } 
        }

        public async void Delete(int id)
        {
            var account = await _accountRepository.GetByIdAsync(id);
            if (account is null)
                throw new NotFoundException("Không tìm thấy tài khoản, không thể xóa.");

            _accountRepository.Delete(account);
            await _unitOfWork.SaveChangeAsync();
        }

        public async Task<IEnumerable<AccountDto>> GetAllAsync()
        {
            return _mapper.Map<IEnumerable<AccountDto>>(
                await _accountRepository.GetAllAsync());
        }

        public async Task<AccountDto> GetByIdAsync(int id)
        {
            var account = await _accountRepository.GetByIdAsync(id);
            if (account is null)
                throw new NotFoundException($"Không tìm thấy tài khoản với Id [{id}].");
            return _mapper.Map<AccountDto>(account);
        }

        public async void Update(AccountDto dto)
        {
            var account = await _accountRepository.GetByIdAsync(dto.Id);
            if (account is null)
                throw new NotFoundException("Không tìm thấy tài khoản, không thể cập nhật.");

            var updatedAccount = _mapper.Map<Account>(dto);
            updatedAccount.Id = dto.Id;

            _accountRepository.Update(updatedAccount);
            await _unitOfWork.SaveChangeAsync();
        }

        public async Task<LoginResponse> Login(LoginRequest accountReq)
        {
            var account = await _accountRepository.GetAsync(a => a.Username == accountReq.Username);
            if (account is null)
                throw new NotFoundException($"Tài khoản không tồn tại.");
            var token = _jwtTokenGenerator.GenerateToken(account.Id, account.Username, account.RoleId);

            return new LoginResponse
            {
                Token = token,
                ExpiredAt = DateTime.UtcNow.AddMinutes(60),
            };
        }
    }
}
