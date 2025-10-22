using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Common;
using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IRepository<Invoice> _invoiceRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRepository<Appointment> _appointmentRepository;
        private readonly IRepository<MedicalService> _medicalServiceRepository;
        private readonly IAccountHelper _accountHelper;
        private readonly IRepository<Patient> _patientRepository;
        private readonly IRepository<PatientMedicalRecord> _medicalRecordRepository;
        private readonly IRepository<Prescription> _prescriptionRepository;
        private readonly IRepository<PrescriptionDetail> _prescriptionDetailRepository;

        public InvoiceService(IRepository<Invoice> invoiceRepository, IMapper mapper, IUnitOfWork unitOfWork, IRepository<Appointment> appointmentRepository, IRepository<MedicalService> medicalServiceRepository, IAccountHelper accountHelper, IRepository<Patient> patientRepository, IRepository<PatientMedicalRecord> medicalRecordRepository, IRepository<Prescription> prescriptionRepository, IRepository<PrescriptionDetail> prescriptionDetailRepository)
        {
            _invoiceRepository = invoiceRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _appointmentRepository = appointmentRepository;
            _medicalServiceRepository = medicalServiceRepository;
            _accountHelper = accountHelper;
            _patientRepository = patientRepository;
            _medicalRecordRepository = medicalRecordRepository;
            _prescriptionRepository = prescriptionRepository;
            _prescriptionDetailRepository = prescriptionDetailRepository;
        }

        public async Task<InvoiceDto> AddAsync(InvoiceDto dto)
        {
            var patientMedicalRecord = await _appointmentRepository.GetByIdAsync(dto.PatientMedicalRecordId);
            if (patientMedicalRecord is null)
                throw new NotFoundException($"Hồ sơ bệnh án với ID {dto.Id} không tồn tại");

            /*SELECT m.Cost FROM PatientMedicalRecord pmr
            INNER JOIN Appointment a ON pmr.AppointmentId = a.Id
            INNER JOIN MedicalService m ON a.MedicalServiceId = m.Id
            where pmr.Id = 1*/
            var medicalService = await (
                from pmr in _medicalRecordRepository.Query()
                join a in _appointmentRepository.Query() on pmr.Id equals a.PatientMedicalRecordId
                join m in _medicalServiceRepository.Query() on a.MedicalServiceId equals m.Id
                where(pmr.Id == dto.PatientMedicalRecordId)
                select m
                ).FirstOrDefaultAsync();

            // Lấy chi tiết đơn thuốc chưa thanh toán để tính giá tiền
            /*
             select DISTINCT i.* from Invoice i
	        INNER JOIN PatientMedicalRecord pmr ON i.PatientMedicalRecordId = pmr.Id
	        INNER JOIN Prescription p ON pmr.Id = p.PatientMedicalRecordId
	        INNER JOIN PrescriptionDetail pd ON p.Id = pd.PrescriptionId
	        where pmr.Id = 3 AND i.Status = 0
             */
            var prescriptionDetails = await (
                from i in _invoiceRepository.Query()
                join pmr in _medicalRecordRepository.Query() on i.PatientMedicalRecordId equals pmr.Id
                join p in _prescriptionRepository.Query() on pmr.Id equals p.PatientMedicalRecordId
                join pd in _prescriptionDetailRepository.Query() on p.Id equals pd.PrescriptionId
                where pmr.Id == dto.PatientMedicalRecordId && i.Status == false
                select pd
            ).Distinct()
            .ToListAsync();

            // Tạo hóa đơn
            dto.Status = false; // Chưa thanh toán
            dto.PaymentDate = DateTime.UtcNow;

            if (medicalService is not null)
                dto.TotalAmount = medicalService.Cost;

            if (prescriptionDetails is not null)
                dto.TotalAmount += prescriptionDetails.Sum(pd => pd.Amount);

            await _invoiceRepository.AddAsync(
                _mapper.Map<Invoice>(dto));  
            return dto;
        }

        public Task Delete(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<InvoiceDto>> GetAllAsync()
        {
            return _mapper.Map<IEnumerable<InvoiceDto>>(
                await _invoiceRepository.Query()
                .Include(i => i.PatientMedicalRecord)
                    .ThenInclude(pmr => pmr.Patient)
                        .ThenInclude(p => p.Account)
                .Include(i => i.PatientMedicalRecord)
                    .ThenInclude(pmr => pmr.Appointments)
                        .ThenInclude(a => a.MedicalService)
                            .ThenInclude(m => m.Specialty)
                .Include(i => i.PatientMedicalRecord)
                    .ThenInclude(pmr => pmr.Prescriptions)
                        .ThenInclude(p => p.PrescriptionDetails)
                            .ThenInclude(pd => pd.Medicine)
                .OrderByDescending(i => i.Id)
                .ToListAsync());
        }

        public async Task<IEnumerable<InvoiceDto>> GetAllInvoiceByPatient()
        {
            var accountId = await _accountHelper.GetAccountId();
            var patient = await _patientRepository.GetAsync(s => s.AccountId == accountId);

            return _mapper.Map<IEnumerable<InvoiceDto>>(await _invoiceRepository.Query()
                .Include(i => i.PatientMedicalRecord)
                    .ThenInclude(pmr => pmr.Appointments)
                        .ThenInclude(a => a.MedicalService)
                            .ThenInclude(m => m.Specialty)
                .Include(i => i.PatientMedicalRecord)
                    .ThenInclude(pmr => pmr.Prescriptions)
                        .ThenInclude(p => p.PrescriptionDetails)
                            .ThenInclude(pd => pd.Medicine)
                .OrderByDescending(i => i.Id)
                .ToListAsync());
        }

        public Task<InvoiceDto> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<InvoiceDto> Update(InvoiceDto dto)
        {
            throw new NotImplementedException();
        }

        public async Task<InvoiceDto> UpdateStatus(InvoiceStatusDto dto)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(dto.Id);
            if (invoice is null)
                throw new NotFoundException($"Hóa đơn với ID {dto.Id} không tồn tại");

            invoice.Status = dto.Status;
            invoice.PaymentDate = DateTime.UtcNow;
            _invoiceRepository.Update(invoice);
            await _unitOfWork.SaveChangeAsync();

            return _mapper.Map<InvoiceDto>(await _invoiceRepository.GetByIdAsync(dto.Id));
        }
    }
}
