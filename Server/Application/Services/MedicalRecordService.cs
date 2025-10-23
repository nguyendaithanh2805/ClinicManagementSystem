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
        private readonly IInvoiceService _invoiceService;
        private readonly IRepository<Appointment> _appointmentRepository;
        private readonly IRepository<Invoice> _invoiceRepository;

        public MedicalRecordService(IRepository<PatientMedicalRecord> patientMedicalRecordRepository, IUnitOfWork unitOfWork, IMapper mapper, IAccountHelper accountHelper, IRepository<Staff> staffRepository, IInvoiceService invoiceService, IRepository<Appointment> appointmentRepository, IRepository<Invoice> invoiceRepository)
        {
            _patientMedicalRecordRepository = patientMedicalRecordRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _accountHelper = accountHelper;
            _staffRepository = staffRepository;
            _invoiceService = invoiceService;
            _appointmentRepository = appointmentRepository;
            _invoiceRepository = invoiceRepository;
        }


        // Tạo hồ sơ bệnh án mặc định
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

        public async Task<IEnumerable<PatientMedicalRecordDto>> GetAllForLabTechnicianAsync()
        {
            var medicalRecord = await _patientMedicalRecordRepository.Query()
                .Include(pmr => pmr.Appointments)
                        .ThenInclude(a => a.MedicalService)
                .Include(pmr => pmr.Prescriptions)
                    .ThenInclude(pr => pr.PrescriptionDetails)
                        .ThenInclude(pd => pd.Medicine)
                .Include(pmr => pmr.Staff)
                    .ThenInclude(s => s.Account)
                .Include(pmr => pmr.Patient)
                    .ThenInclude(s => s.Account)
                .Include(pmr => pmr.Symptoms)
                .Include(pmr => pmr.TestResults)
                    .ThenInclude(t => t.Staff) // Nhân viên xét nghiệm
                        .ThenInclude(s => s.Account)
                .Where(pmr => pmr.RequiresTest == true)
                .OrderByDescending(pmr => pmr.Id)
                .ToListAsync();
            return _mapper.Map<IEnumerable<PatientMedicalRecordDto>>(medicalRecord);
        }

        public async Task<IEnumerable<PatientMedicalRecordDto>> GetAllByDoctorAsync()
        {
            var accountId = await _accountHelper.GetAccountId();
            var staff = await _staffRepository.GetAsync(s => s.AccountId == accountId);

            var medicalRecord = await _patientMedicalRecordRepository.Query()
               .Include(pmr => pmr.Appointments.OrderByDescending(a => a.Id))
                        .ThenInclude(a => a.MedicalService)
                .Include(pmr => pmr.Prescriptions)
                    .ThenInclude(pr => pr.PrescriptionDetails)
                        .ThenInclude(pd => pd.Medicine)
                .Include(pmr => pmr.Staff)
                    .ThenInclude(s => s.Account)
                .Include(pmr => pmr.Patient)
                    .ThenInclude(p => p.Account)
                .Include(pmr => pmr.Symptoms)
                .Include(pmr => pmr.TestResults)
                    .ThenInclude(t => t.Staff) // Nhân viên xét nghiệm
                        .ThenInclude(s => s.Account)
                .Where(p => p.StaffId == staff.Id)
                .Distinct()
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
                throw new NotFoundException($"Không tìm thấy Hồ sơ bệnh án với ID {dto.Id}");

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
        public async Task ConfirmCompleted(int medicalRecordId)
        {
            try
            {
                await _unitOfWork.BeginTransactionAsync();

                var medicalRecord = await _patientMedicalRecordRepository.GetByIdAsync(medicalRecordId);
                if (medicalRecord is null)
                    throw new NotFoundException($"Không tìm thấy Hồ sơ bệnh án với ID {medicalRecordId}");

                // Chưa nhập thông tin ở tab tổng quan nên ko callback ở fe đc
                var appointment = await _appointmentRepository.GetAsync(a => a.PatientMedicalRecordId == medicalRecordId);
                if (appointment.Status != AppointmentStatus.InProgress)
                    throw new Exception("Vui lòng nhập thông tin khám bệnh cho bệnh nhân");

                medicalRecord.Status = true; // Xác nhận HSBA đã hoàn thành
                _patientMedicalRecordRepository.Update(medicalRecord);

                // Tạo hóa đơn với pmrId
                var invoiceDto = new InvoiceDto
                {
                    PatientMedicalRecordId = medicalRecordId,
                };
                await _invoiceService.AddAsync(invoiceDto);

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

        // Xác nhận tái khám,
        // lúc này tạo lịch hẹn mới với status đã xác nhận và có pmr của HSBA hiện tại cùng tt lịch hẹn hiện tại
        public async Task ConfirmIsRevisit(int medicalRecordId, ConfirmIsRevisitAppointment confirmIsRevisitAppointment)
        {
            try
            {
                await _unitOfWork.BeginTransactionAsync();

                var medicalRecord = await _patientMedicalRecordRepository.GetByIdAsync(medicalRecordId);
                if (medicalRecord is null)
                    throw new NotFoundException($"Không tìm thấy Hồ sơ bệnh án với ID {medicalRecordId}");

                var invoice = await _invoiceRepository.GetAsync(i =>
                    i.PatientMedicalRecordId == medicalRecord.Id
                    && i.Status == false);
                if (invoice is not null)
                    throw new ErrorException("Bệnh nhân chưa thanh toán hóa đơn cho lần khám này, vui lòng liên hệ Lễ tân để xác nhận thanh toán");

                medicalRecord.Status = true;  // Tạm hoàn thành cho đến khi bệnh nhân đến Lễ tân cập nhật trạng thái lịch hẹn 'Đã đến' sẽ mở lại cho edit
                _patientMedicalRecordRepository.Update(medicalRecord);

                // Tìm tất cả lịch hẹn theo HSBA cần tái khám
                var appointmentChecks = await _appointmentRepository.GetAllAsync(a => 
                a.PatientMedicalRecordId == medicalRecordId 
                && (a.Revisit == RevisitStatus.NeedRevisit));
                if (appointmentChecks.Any())
                    throw new NotFoundException($"Bệnh nhân đã có lịch tái khám với hồ sơ bệnh án này, vui lòng kiểm tra");


                /*SELECT* FROm PatientMedicalRecord pd
                INNER JOIN Appointment a ON pd.Id = a.PatientMedicalRecordId
                where pd.Id = 1 AND a.Revisit = 0*/
                // Nếu chưa có
                // Tìm lịch hẹn đang khám hoặc đã HT với HSBA hiện tại(Lấy mặc định LH đầu vì nó giống nhau)
                // Vì lúc đang khám thì chưa có lịch tái khám, lúc đặt lịch tái khám rồi xác nhận hoàn thành tái khám thì lịch hẹn đã ở status completed
                var appointment = await (
                    from pmr in _patientMedicalRecordRepository.Query()
                    join a in _appointmentRepository.Query() on pmr.Id equals a.PatientMedicalRecordId
                    where pmr.Id == medicalRecordId && (a.Status == AppointmentStatus.InProgress || a.Status == AppointmentStatus.Completed)
                    select a
                    ).FirstOrDefaultAsync();

                if (appointment is not null)
                {
                    // Đồng thời cập nhật lịch đang khám thành hoàn thành -> tạo lịch mới là đã xác nhận
                    appointment.Status = AppointmentStatus.Completed;
                    _appointmentRepository.Update(appointment);

                    var appointmentNew = new Appointment
                    {
                        PatientId = appointment.PatientId,
                        StaffId = appointment.StaffId,
                        MedicalServiceId = appointment.MedicalServiceId,
                        PatientMedicalRecordId = medicalRecordId,
                        Revisit = RevisitStatus.NeedRevisit,
                        Status = AppointmentStatus.Confirmed,
                        AppointmentDate = confirmIsRevisitAppointment.AppointmentDate,
                        AppointmentTime = confirmIsRevisitAppointment.AppointmentTime
                    };
                    await _appointmentRepository.AddAsync(appointmentNew);
                }    
                await _unitOfWork.CommitAsync();
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
        }

        // Cập nhật hoàn thành tái khám
        public async Task ConfirmCompletedRevisit(int medicalRecordId)
        {
            try
            {
                await _unitOfWork.BeginTransactionAsync();

                var medicalRecord = await _patientMedicalRecordRepository.GetByIdAsync(medicalRecordId);
                if (medicalRecord is null)
                    throw new NotFoundException($"Không tìm thấy Hồ sơ bệnh án với ID {medicalRecordId}");

                // Tìm lịch hẹn đang khám
                var appointment = await _appointmentRepository.GetAsync(a => 
                    a.PatientMedicalRecordId == medicalRecordId 
                    && a.Status == AppointmentStatus.InProgress);
                if (appointment is null)
                    throw new NotFoundException($"Không tìm thấy lịch hẹn với ID {medicalRecordId}");

                appointment.Revisit = RevisitStatus.Completed;
                appointment.Status = AppointmentStatus.Completed;
                _appointmentRepository.Update(appointment);

                // Tạo hóa đơn
                var invoiceDto = new InvoiceDto
                {
                    PatientMedicalRecordId = medicalRecordId,
                };
                await _invoiceService.AddAsync(invoiceDto);

                await _unitOfWork.CommitAsync();
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
        }

        public Task<IEnumerable<PatientMedicalRecordDto>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        // Khi lịch hẹn chuyển sang trạng thái đang khám thì nó cũng phải đưa tái khám về false để nếu muốn tái khám nữa thì mới được
        public async Task ConfirmInProgress(int medicalRecordId)
        {
            var medicalRecord = await _patientMedicalRecordRepository.GetByIdAsync(medicalRecordId);
            if (medicalRecord is null)
                throw new NotFoundException($"Không tìm thấy Hồ sơ bệnh án với ID {medicalRecordId}");

            // Tìm lịch hẹn có trạng thái đã đến và chuyển nó thành trạng thái đang khám
            var appointment = await _appointmentRepository.GetAsync(a => 
                a.PatientMedicalRecordId == medicalRecordId
                && a.Status == AppointmentStatus.CheckedIn);
            if (appointment is not null)
            {
                // appointment.IsRevisit = false;
                appointment.Status = AppointmentStatus.InProgress;
                _appointmentRepository.Update(appointment);
                await _unitOfWork.SaveChangeAsync();
            }
        }
    }
}
