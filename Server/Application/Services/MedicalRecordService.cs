using System;
using System.Collections;
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
        private readonly IRepository<Medicine> _medicineRepository;
        private readonly IRepository<Patient> _patientRepository;
        private readonly IRepository<Appointment> _appointmentRepository;
        private readonly IRepository<Invoice> _invoiceRepository;
        private readonly IRepository<Prescription> _prescriptionRepository;
        private readonly IRepository<PrescriptionDetail> _prescriptionDetailRepository;
        private readonly IInvoiceService _invoiceService;

        public MedicalRecordService(IRepository<PatientMedicalRecord> patientMedicalRecordRepository, IUnitOfWork unitOfWork, IMapper mapper, IAccountHelper accountHelper, IRepository<Staff> staffRepository, IRepository<Medicine> medicineRepository, IRepository<Patient> patientRepository, IRepository<Appointment> appointmentRepository, IRepository<Invoice> invoiceRepository, IRepository<Prescription> prescriptionRepository, IRepository<PrescriptionDetail> prescriptionDetailRepository, IInvoiceService invoiceService)
        {
            _patientMedicalRecordRepository = patientMedicalRecordRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _accountHelper = accountHelper;
            _staffRepository = staffRepository;
            _medicineRepository = medicineRepository;
            _patientRepository = patientRepository;
            _appointmentRepository = appointmentRepository;
            _invoiceRepository = invoiceRepository;
            _prescriptionRepository = prescriptionRepository;
            _prescriptionDetailRepository = prescriptionDetailRepository;
            _invoiceService = invoiceService;
        }

        public async Task<PatientMedicalRecordDto> AddAsync(PatientMedicalRecordDto dto)
        {
            dto.CreateAt = DateTime.UtcNow;
            dto.Status = false; // Chưa hoàn thành
            await _patientMedicalRecordRepository.AddAsync(_mapper.Map<PatientMedicalRecord>(dto));
            return dto;
        }

        public Task Delete(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<PatientMedicalRecordDto>> GetAllAsync()
        {
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
                .Where(p => p.RequiresTest == true)
                .OrderByDescending(pmr => pmr.Id)
                .ToListAsync();
            return _mapper.Map<IEnumerable<PatientMedicalRecordDto>>(medicalRecord);
        }

        public async Task<IEnumerable<PatientMedicalRecordDto>> GetAllByDoctorAsync()
        {
            var accountId = await _accountHelper.GetAccountId();
            var staff = await _staffRepository.GetAsync(s => s.AccountId == accountId);

            var medicalRecord = await _patientMedicalRecordRepository.Query()
                .Include(p => p.Patient)
                    .ThenInclude(pt => pt.Appointments)
                        .ThenInclude(a => a.MedicalService)
                .Include(p => p.Prescriptions)
                    .ThenInclude(pr => pr.PrescriptionDetails)
                        .ThenInclude(pd => pd.Medicine)
                .Include(p => p.Staff)
                    .ThenInclude(s => s.Account)
                .Include(p => p.Symptoms)
                .Include(p => p.TestResults)
                    .ThenInclude(t => t.Staff)
                        .ThenInclude(s => s.Account)
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

            medicalRecord.CreateAt = DateTime.UtcNow;
            medicalRecord.Diagnosis = dto.Diagnosis;
            medicalRecord.TreatmentMethod = dto.TreatmentMethod;
            medicalRecord.RequiresTest = dto.RequiresTest;

            _patientMedicalRecordRepository.Update(medicalRecord);
            await _unitOfWork.SaveChangeAsync();
            return dto;
        }

        /// <summary>
        /// Cập nhật trạng thái hoàn thành cho hồ sơ bệnh án và cập nhật tổng tiền thuốc vào hóa đơn tương ứng.
        /// </summary>
        public async Task UpdateStatus(int medicalRecordId)
        {
            try
            {
                await _unitOfWork.BeginTransactionAsync();

                var medicalRecord = await _patientMedicalRecordRepository.GetByIdAsync(medicalRecordId);
                if (medicalRecord is null)
                    throw new NotFoundException($"Không tìm thấy Hồ sơ Bệnh án với ID {medicalRecordId}");

                medicalRecord.Status = true;
                _patientMedicalRecordRepository.Update(medicalRecord);

                if (medicalRecord.Status)
                {
                    var invoiceDto = new InvoiceDto
                    {
                        PatientMedicalRecordId = medicalRecordId,
                    };
                    await _invoiceService.AddAsync(invoiceDto);
                }

                ///*
                //    SELECT i.* FROM Appointment a
                //    INNER JOIN PatientMedicalRecord pmr ON a.Id = pmr.AppointmentId
                //    INNER JOIN Invoice i ON a.Id = i.AppointmentId
                //    where pmr.Id = 7
                
                //    Id  AppointmentId   PrescriptionId  PaymentDate                 TotalAmount     Status
                //    5	8	            NULL	        2025-10-20 11:08:59.400	    300000	        0
                //*/
                ///*
                // *  Mục đích là tìm hóa đơn theo lịch hẹn dựa vào Id hồ sơ bệnh án để cập nhật tổng tiền
                // *  Lúc này sẽ tìm được hóa đơn tạm đã được tạo lúc lịch hẹn đã xác nhận bởi lễ tân, 
                //        nhưng hiện tại prescriptionId của cái này đang null nên sẽ update thêm prescriptionId cho nó
                //*/
                //var invoice = await (
                //    from a in _appointmentRepository.Query()
                //    join pmr in _patientMedicalRecordRepository.Query() on a.Id equals pmr.AppointmentId
                //    join i in _invoiceRepository.Query() on a.Id equals i.AppointmentId
                //    where pmr.Id == medicalRecordId
                //    select i
                //).FirstOrDefaultAsync();

                ///*
                // select pd.* from PrescriptionDetail pd
                //    INNER JOIN Prescription p ON pd.PrescriptionId = p.Id
                //    INNER JOIN PatientMedicalRecord pmr ON p.PatientMedicalRecordId = pmr.Id
                //    where pmr.Id = 8

                //PrescriptionId  MedicineId  Quantity    Dosage	        Frequency	Amount
                //7	            102	        11	        2 viên/ ngày	Sáng	    303776
                //7	            112	        11	        2 viên/ ngày	Sáng	    403502
                // */
                //// Mục đích là tìm thành tiền của chi tiết đơn thuốc rồi theo lịch hẹn rồi cập nhật vào tổng tiền của hóa đơn
                //var prescriptionDetails = await (
                //    from pd in _prescriptionDetailRepository.Query()
                //    join p in _prescriptionRepository.Query() on pd.PrescriptionId equals p.Id
                //    join pmr in _patientMedicalRecordRepository.Query() on p.PatientMedicalRecordId equals pmr.Id
                //    where pmr.AppointmentId == medicalRecord.AppointmentId
                //    select pd
                //).ToListAsync();

                ////// Tìm đơn thuốc muốn cộng tiền vào hóa đơn theo hồ sơ bệnh án
                ////var prescription = await _prescriptionRepository.Query()
                ////    .Where(p => p.PatientMedicalRecordId == medicalRecordId)
                ////    .OrderByDescending(p => p.PrescriptionDate)
                ////    .FirstOrDefaultAsync();


                ////if (invoice != null)
                ////    foreach (var prescriptionDetail in prescriptionDetails)
                ////    {
                ////        invoice.PrescriptionId = prescriptionDetail.PrescriptionId;
                ////        invoice.TotalAmount += prescriptionDetail.Amount;
                ////    }

                ////_invoiceRepository.Update(invoice!);
                await _unitOfWork.CommitAsync();
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
        }
    }
}
