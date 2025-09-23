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
        private readonly IPatientService _patientService;
        private readonly IService<RoleDto> _roleService;

        public AuthService(IRepository<Account> accountRepository, IMapper mapper, IUnitOfWork unitOfWork, IJwtTokenGenerator jwtTokenGenerator, IPasswordHasher<AccountDto> passwordHasher, IPatientService patientService, IService<RoleDto> roleService)
        {
            _accountRepository = accountRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _jwtTokenGenerator = jwtTokenGenerator;
            _passwordHasher = passwordHasher;
            _patientService = patientService;
            _roleService = roleService;
        }

        public async Task<AccountDto> AddAsync(AccountDto dto)
        {
            var accountExisting = await _accountRepository.GetAsync(x => x.Username == dto.Username);
            if (accountExisting is not null)
                throw new AlreadyExistsException("Tên đăng nhập đã tồn tại.");
            dto.Password = _passwordHasher.HashPassword(dto, dto.Password);
            
            try
            {
                await _unitOfWork.BeginTransactionAsync();

                if (dto.RoleId == 0)
                    dto.RoleId = 2;

                var accountEntity = _mapper.Map<Account>(dto);
                await _accountRepository.AddAsync(accountEntity);
                await _unitOfWork.SaveChangeAsync();

                // patient
                if (accountEntity.RoleId == 2)
                {
                    var patient = new PatientDto
                    {
                        AccountId = accountEntity.Id,
                    };

                    await _patientService.AddAsync(patient);    
                }
                // Staff

                await _unitOfWork.CommitAsync();
                return dto;
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            } 
        }

        public async Task Delete(int id)
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

        public async Task<AccountDto> Update(AccountDto dto)
        {
            var account = await _accountRepository.GetByIdAsync(dto.Id);
            if (account is null)
                throw new NotFoundException("Không tìm thấy tài khoản, không thể cập nhật.");

            var updatedAccount = _mapper.Map<Account>(dto);
            updatedAccount.Id = dto.Id;

            _accountRepository.Update(updatedAccount);
            await _unitOfWork.SaveChangeAsync();

            return _mapper.Map<AccountDto>(await _accountRepository.GetByIdAsync(dto.Id));
        }

        public async Task<LoginResponse> Login(LoginRequest accountReq)
        {
            var account = await _accountRepository.GetAsync(a => a.Username == accountReq.Username);
            if (account is null)
                throw new NotFoundException($"Tài khoản không tồn tại.");

            // So sánh mật khẩu nhập với mật khẩu đã hash trong DB
            var result = _passwordHasher.VerifyHashedPassword(_mapper.Map<AccountDto>(account), account.Password, accountReq.Password);
            if (result == PasswordVerificationResult.Failed)
                throw new UnauthorizedAccessException("Mật khẩu không đúng.");

            var role = await _roleService.GetByIdAsync(account.RoleId);
            var token = _jwtTokenGenerator.GenerateToken(account.Id, account.Username, role.Name);

            return new LoginResponse
            {
                Token = token,
                ExpiredAt = DateTime.UtcNow.AddMinutes(60),
            };
        }
    }
}
