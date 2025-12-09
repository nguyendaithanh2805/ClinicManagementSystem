using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Common;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class TestResultService : ITestResultService
    {
        private readonly IRepository<TestResult> _testResultRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IRepository<Staff> _staffRepository;
        private readonly IAccountHelper _accountHelper;
        private readonly IRepository<PatientMedicalRecord> _patientMedicalRecordRepository;
        private readonly IFileStorageService _fileStorageService;

        public TestResultService(IRepository<TestResult> testResultRepository, IUnitOfWork unitOfWork, IMapper mapper, IRepository<Staff> staffRepository, IAccountHelper accountHelper, IRepository<PatientMedicalRecord> patientMedicalRecordRepository, IFileStorageService fileStorageService)
        {
            _testResultRepository = testResultRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _staffRepository = staffRepository;
            _accountHelper = accountHelper;
            _patientMedicalRecordRepository = patientMedicalRecordRepository;
            _fileStorageService = fileStorageService;
        }

        public async Task<TestResultDto> AddAsync(TestResultDto dto)
        {
            var accountId = await _accountHelper.GetAccountId();
            var staff = await _staffRepository.GetAsync(s => s.AccountId == accountId);

            dto.StaffId = staff.Id;
            dto.CreatedAt = DateTime.UtcNow;
            await _testResultRepository.AddAsync(_mapper.Map<TestResult>(dto));
            await _unitOfWork.SaveChangeAsync();
            return dto;
        }

        public async Task Delete(int id)
        {
            var testResult = await _testResultRepository.GetByIdAsync(id);
            if (testResult is null)
                throw new DirectoryNotFoundException($"Không tìm thấy xét nghiệm với ID {id}");

            if (testResult.Image is not null)
                await _fileStorageService.DeleteFileAsync(testResult.Image);

            _testResultRepository.Delete(testResult);
            await _unitOfWork.SaveChangeAsync();
        }

        public async Task<IEnumerable<TestResultDto>> GetAllAsync()
        {
            return _mapper.Map<IEnumerable<TestResultDto>>(await _testResultRepository.GetAllAsync());
        }

        public async Task<IEnumerable<PatientMedicalRecordDto>> GetAllMedicalRecordWithRequiredTest()
        {
            return _mapper.Map<IEnumerable<PatientMedicalRecordDto>>(
                await _patientMedicalRecordRepository.Query()
                .Where(pmr => pmr.RequiresTest == true)
                .ToListAsync());
        }

        public Task<TestResultDto> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<TestResultDto> Update(TestResultDto dto)
        {
            var accountId = await _accountHelper.GetAccountId();
            var staff = await _staffRepository.GetAsync(s => s.AccountId == accountId);

            var testResult = await _testResultRepository.GetByIdAsync(dto.Id);
            if (testResult is null)
                throw new DirectoryNotFoundException($"Không tìm thấy xét nghiệm với ID {dto.Id}");

            testResult.StaffId = staff.Id;
            testResult.Name = dto.Name;
            testResult.Description = dto.Description;
            testResult.CreatedAt = DateTime.UtcNow;

            // Chỉ update ảnh nếu có giá trị mới
            if (!string.IsNullOrEmpty(dto.Image))
            {
                testResult.Image = dto.Image;
            }

            _testResultRepository.Update(testResult);
            await _unitOfWork.SaveChangeAsync();
            return dto;
        }
    }
}
