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
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class MedicalRecordService : IMedicalRecordService
    {
        private readonly IRepository<PatientMedicalRecord> _patientMedicalRecordRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IAccountHelper _accountHelper;
        private readonly IRepository<Staff> _staffRepository;

        public MedicalRecordService(IRepository<PatientMedicalRecord> patientMedicalRecordRepository, IUnitOfWork unitOfWork, IMapper mapper, IAccountHelper accountHelper, IRepository<Staff> staffRepository)
        {
            _patientMedicalRecordRepository = patientMedicalRecordRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _accountHelper = accountHelper;
            _staffRepository = staffRepository;
        }

        public async Task<PatientMedicalRecordDto> AddAsync(PatientMedicalRecordDto dto)
        {
            await _patientMedicalRecordRepository.AddAsync(_mapper.Map<PatientMedicalRecord>(dto));
            return dto;
        }

        public Task Delete(int id)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<PatientMedicalRecordDto>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<PatientMedicalRecordDto>> GetAllByDoctorAsync()
        {
            var accountId = _accountHelper.GetAccountId();
            var staff = await _staffRepository.GetAsync(s => s.AccountId == accountId);

            var medicalRecord = await _patientMedicalRecordRepository.Query()
                .Include(p => p.Patient)
                    .ThenInclude(pt => pt.Appointments)
                        .ThenInclude(a => a.MedicalService)
                .Include(p => p.Prescriptions)
                    .ThenInclude(pr => pr.PrescriptionDetails)
                        .ThenInclude(pd => pd.Medicine)
                .Include(p => p.Staff)
                .Include(p => p.Symptoms)
                .Include(p => p.TestResults)
                    .ThenInclude(t => t.Staff)
                .Where(p => p.StaffId == staff.Id)
                .ToListAsync();
            return _mapper.Map<IEnumerable<PatientMedicalRecordDto>>(medicalRecord);
        }

        public async Task<PatientMedicalRecordDto> GetByIdAsync(int id)
        {
            return _mapper.Map<PatientMedicalRecordDto>(await _patientMedicalRecordRepository.GetByIdAsync(id));
        }

        public async Task<PatientMedicalRecordDto> Update(PatientMedicalRecordDto dto)
        {
            var medicalRecord = await _patientMedicalRecordRepository.GetByIdAsync(dto.Id);
            if (medicalRecord is null)
                throw new NotFoundException($"Không tìm thấy Hồ sơ Bệnh án với ID {dto.Id}");

            medicalRecord.Diagnosis = dto.Diagnosis;
            medicalRecord.TreatmentMethod = dto.TreatmentMethod;
            medicalRecord.RequiresTest = dto.RequiresTest;

            _patientMedicalRecordRepository.Update(medicalRecord);
            await _unitOfWork.SaveChangeAsync();
            return dto;
        }
    }
}
