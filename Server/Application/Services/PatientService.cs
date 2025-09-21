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
    public class PatientService : IPatientService
    {
        private readonly IRepository<Patient> _patientRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAccounService _accountService;
        private readonly IPasswordHasher<PatientWithAccountDto> _passwordHasher;
        private readonly IRepository<Account> _accountRepository;

        public PatientService(IRepository<Patient> patientRepository, IMapper mapper, IUnitOfWork unitOfWork, IAccounService accountService, IPasswordHasher<PatientWithAccountDto> passwordHasher, IRepository<Account> accountRepository)
        {
            _patientRepository = patientRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _accountService = accountService;
            _passwordHasher = passwordHasher;
            _accountRepository = accountRepository;
        }

        public async Task<PatientDto> AddAsync(PatientDto dto)
        {
            dto.FullName = "Bệnh nhân chưa có tên";

            await _patientRepository.AddAsync(
                _mapper.Map<Patient>(dto));
            return dto;
        }

        public async Task<PatientWithAccountDto> AddPatientWithAccountAsync(PatientWithAccountDto dto)
        {
            try
            {
                await _unitOfWork.BeginTransactionAsync();

                await _accountService.GetByUsername(dto.Username!);
                var account = new Account
                {
                    Username = dto.Username!,
                    Password = _passwordHasher.HashPassword(dto, dto.Password),
                    RoleId = 3,
                    PhoneNumber = dto.PhoneNumber,
                    Email = dto.Email,
                };
                await _accountRepository.AddAsync(account);
                await _unitOfWork.SaveChangeAsync();

                dto.AccountId = account.Id;
                await _patientRepository.AddAsync(_mapper.Map<Patient>(dto));

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
            var patient = await _patientRepository.GetByIdAsync(id);
            if (patient is null)
                throw new NotFoundException($"Không tìm thấy bệnh nhân với ID {id}");

            try
            {
                await _unitOfWork.BeginTransactionAsync();
                await _accountService.Delete(patient.AccountId);

                _patientRepository.Delete(patient);

                await _unitOfWork.CommitAsync();
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<PatientDto>> GetAllAsync()
        {
            return _mapper.Map<IEnumerable<PatientDto>>(await _patientRepository.GetAllAsync());
        }

        public async Task<IEnumerable<PatientWithAccountDto>> GetAllWithAccountAsync()
        {
            var patients = await _patientRepository.Query().Include(p => p.Account).ToListAsync();
            return patients.Select(p => new PatientWithAccountDto
            {
                Id = p.Id,
                AccountId = p.AccountId,
                FullName = p.FullName,
                DateOfBirth = p.DateOfBirth,
                Address = p.Address,
                PhoneNumber = p.Account?.PhoneNumber,
                Email = p.Account?.Email
            });
        }

        public async Task<PatientDto> GetByIdAsync(int id)
        {
            var patient = await _patientRepository.GetByIdAsync(id);
            if (patient is null)
                throw new NotFoundException($"Không tìm thấy bệnh nhân với ID {id}");
            return _mapper.Map<PatientDto>(patient);
        }

        public async Task<PatientDto> Update(PatientDto dto)
        {
            var patient = await _patientRepository.GetByIdAsync(dto.Id);
            if (patient is null)
                throw new NotFoundException("Không tìm thấy bệnh nhân, không thể cập nhật.");

            patient.FullName = dto.FullName!;
            patient.DateOfBirth = dto.DateOfBirth;
            patient.Address = dto.Address;
            _patientRepository.Update(patient);
            await _unitOfWork.SaveChangeAsync();

            return _mapper.Map<PatientDto>(await _patientRepository.GetByIdAsync(dto.Id));
        }
    }
}
