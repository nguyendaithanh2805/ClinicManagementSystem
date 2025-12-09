using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
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
    public class AppointmentService : IAppointmentService
    {
        private readonly IRepository<Appointment> _appointmentRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IAccountHelper _accountHelper;
        private readonly IRepository<Invoice> _invoiceRepository;
        private readonly IInvoiceService _invoiceService;
        private readonly IRepository<Patient> _patientRepository;
        private readonly IRepository<Staff> _staffRepository;
        private readonly IMedicalRecordService _medicalRecordService;
        private readonly IRepository<Account> _accountRepository;
        private readonly IRepository<PatientMedicalRecord> _medicalRecordRepository;
        private readonly IRepository<Notification> _notificationRepository;
        private readonly INotificationService _notificationService;

        public AppointmentService(IRepository<Appointment> appointmentRepository, IUnitOfWork unitOfWork, IMapper mapper, IAccountHelper accountHelper, IRepository<Invoice> invoiceRepository, IInvoiceService invoiceService, IRepository<Patient> patientRepository, IRepository<Staff> staffRepository, IMedicalRecordService medicalRecordService, IRepository<Account> accountRepository, IRepository<PatientMedicalRecord> medicalRecordRepository, IRepository<Notification> notificationRepository, INotificationService notificationService)
        {
            _appointmentRepository = appointmentRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _accountHelper = accountHelper;
            _invoiceRepository = invoiceRepository;
            _invoiceService = invoiceService;
            _patientRepository = patientRepository;
            _staffRepository = staffRepository;
            _medicalRecordService = medicalRecordService;
            _accountRepository = accountRepository;
            _medicalRecordRepository = medicalRecordRepository;
            _notificationRepository = notificationRepository;
            _notificationService = notificationService;
        }

        public async Task<AppointmentDto> AddAsync(AppointmentDto dto)
        {
            var accountId = await _accountHelper.GetAccountId();
            var patient = await _patientRepository.GetAsync(p => p.AccountId == accountId);

            // Tìm lịch hẹn của bệnh nhân chờ xác nhận với dịch vụ y tế
            var appointment = await _appointmentRepository.GetAsync(a => a.PatientId == patient.Id 
                && a.Status == AppointmentStatus.Pending
                && a.MedicalServiceId == dto.MedicalServiceId);
            if (appointment is not null)
                throw new AlreadyExistsException("Bạn có một lịch hẹn tương tự với dịch vụ này đang chờ xác nhận");

            var appointmentCheckDate = await _appointmentRepository.GetAllAsync(a => 
                a.PatientId == patient.Id
                && a.AppointmentDate == dto.AppointmentDate);
            if (appointmentCheckDate.Any())
                throw new AlreadyExistsException("Bạn có một lịch hẹn khác có cùng ngày khám");

            try
            {
                await _unitOfWork.BeginTransactionAsync();

                dto.PatientId = patient.Id;
                dto.Status = AppointmentStatus.Pending;
                dto.Revisit = RevisitStatus.None; // Mặc định là không tái khám

                await _appointmentRepository.AddAsync(
                    _mapper.Map<Appointment>(dto));

                if (dto.FullName is not null)
                {
                    patient.FullName = dto.FullName;
                    _patientRepository.Update(patient);
                }

                if (dto.phoneNumber is not null)
                {
                    var account = await _accountRepository.GetByIdAsync(accountId);
                    account.PhoneNumber = dto.phoneNumber;
                    _accountRepository.Update(account);
                }

                await _unitOfWork.CommitAsync();
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
            return dto;
        }

        public async Task Delete(int id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment is null)
                throw new NotFoundException($"Không tìm thấy lịch hẹn với ID {id}");

            if (appointment.Status != AppointmentStatus.Pending)
                throw new Exception("Chỉ cho phép hủy lịch hẹn với trạng thái chờ xác nhận");

            try
            {
                await _unitOfWork.BeginTransactionAsync();

                // invoice (1-1)
                var invoice = await _invoiceRepository.GetByIdAsync(appointment.Id);
                if (invoice is not null)
                    _invoiceRepository.Delete(invoice);

                _appointmentRepository.Delete(appointment);

                await _unitOfWork.CommitAsync();
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<AppointmentDto>> GetAllAppointmentByPatient()
        {
            var accountId = await _accountHelper.GetAccountId();
            var patient = await _patientRepository.GetAsync(s => s.AccountId == accountId);

            return _mapper.Map<IEnumerable<AppointmentDto>>(
                await _appointmentRepository.Query()
                .Include(a => a.Patient)
                .Include(a => a.Staff)
                .Include(a => a.MedicalService)
                .Where(a => a.PatientId == patient.Id)
                .OrderByDescending(a => a.Id)
                .ToListAsync());
        }

        public async Task<IEnumerable<AppointmentDto>> GetAllAsync()
        {

            return _mapper.Map<IEnumerable<AppointmentDto>>(
                await _appointmentRepository.Query()
                .Include(a => a.Patient)
                .Include(a => a.Staff)
                .Include(a => a.MedicalService)
                .OrderByDescending(a => a.Id)
                .ToListAsync());
        }

        public async Task<IEnumerable<AppointmentDto>> GetByDoctorAsync()
        {
            var accountId = await _accountHelper.GetAccountId();
            var staff = await _staffRepository.GetAsync(s => s.AccountId == accountId);

            return _mapper.Map<IEnumerable<AppointmentDto>>(
                await _appointmentRepository.Query()
                .Include(a => a.Patient)
                .Include(a => a.Staff)
                .Include(a => a.MedicalService)
                .Where(a => a.StaffId == staff.Id)
                .OrderByDescending(a => a.Id)
                .ToListAsync());
        }

        public async Task<AppointmentDto> GetByIdAsync(int id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment is null)
                throw new NotFoundException($"Không tìm thấy lịch hẹn với ID {id}");
            return _mapper.Map<AppointmentDto>(appointment);
        }

        // Update appointment status and add invoice when the appointment status is 'Completed'
        public async Task<AppointmentDto> Update(AppointmentDto dto)
        {
            // Tìm tất cả lịch hẹn của bệnh nhân, xem có cái nào đã đến hoặc đang khám ko
            var appointmentByPatients = await _appointmentRepository.GetAllAsync(a =>
                a.PatientId == dto.PatientId &&
                (a.Status == AppointmentStatus.CheckedIn || a.Status == AppointmentStatus.InProgress));
            if (appointmentByPatients.Any())
                throw new ErrorException("Bệnh nhân đang khám dịch vụ khác tại phòng khám, không thể xác nhận cho đến khi hoàn thành khám");

            var appointment = await _appointmentRepository.GetByIdAsync(dto.Id);
            if (appointment is null)
                throw new ErrorException("Không tìm thấy lịch hẹn, không thể cập nhật");

            if (appointment.Status == AppointmentStatus.Pending 
                && dto.Status == AppointmentStatus.Completed)
                throw new ErrorException("Vui lòng xác nhận lịch hẹn trước");

            if (appointment.Status == AppointmentStatus.Confirmed 
                && dto.Status == AppointmentStatus.Pending)
                throw new ErrorException("Lịch hẹn này đã được xác nhận, vì vậy không thể thay đổi thành chờ xác nhận");

            if (appointment.Status == AppointmentStatus.Confirmed 
                && dto.StaffId != appointment.StaffId)
                throw new ErrorException("Lịch hẹn này đã được xác nhận, vì vậy không thể thay đổi Bác sĩ khám");


            if (appointment.Status == AppointmentStatus.Completed)
                throw new ErrorException("Lịch hẹn này đã hoàn thành, không thể thay đổi trạng thái");

            if (appointment.Status == AppointmentStatus.Cancelled)
                throw new ErrorException("Lịch hẹn này đã bị hủy, không thể thay đổi trạng thái");

            if (dto.Status == AppointmentStatus.Cancelled 
                && dto.StaffId != appointment.StaffId)
                throw new ErrorException("Không thể thay đổi bác sĩ cho lịch hẹn đánh dấu trạng thái là hủy");

            if (appointment.Status == AppointmentStatus.Pending
                && dto.StaffId is null
                && dto.Status != AppointmentStatus.Cancelled)
                throw new ErrorException("Vui lòng phân công bác sĩ cho lịch hẹn này");

            try
            {
                await _unitOfWork.BeginTransactionAsync();

                if (dto.Status == AppointmentStatus.Confirmed && dto.StaffId is not null)
                {
                    var patient = await _patientRepository.GetByIdAsync(dto.PatientId);
                    var staff = await _staffRepository.GetByIdAsync((int)dto.StaffId);

                    // 1. TẠO THÔNG BÁO CHO BN
                    var patientNotification = new Notification
                    {
                        AccountId = patient.AccountId,
                        Title = "Lịch khám đã được xác nhận",
                        Message = $"Lịch khám của bạn với BS. {staff.FullName} đã được xác nhận.",
                        Type = "appointment",
                        CreatedAt = DateTime.UtcNow,
                        IsRead = false
                    };
                    await _notificationRepository.AddAsync(patientNotification);
                    await _notificationService.SendRealtimePush(patientNotification);

                    // 2. TẠO THÔNG BÁO CHO BÁC SĨ
                    var doctorNotification = new Notification
                    {
                        AccountId = staff.AccountId,
                        Title = "Lịch hẹn mới",
                        Message = $"Bạn có lịch hẹn với bệnh nhân {patient.FullName} đã được xác nhận.",
                        Type = "appointment",
                        CreatedAt = DateTime.UtcNow,
                        IsRead = false
                    };
                    await _notificationRepository.AddAsync(doctorNotification);
                    await _notificationService.SendRealtimePush(doctorNotification);
                }

                if (appointment.Status == AppointmentStatus.Confirmed &&
                    dto.Status == AppointmentStatus.CheckedIn)
                {
                    var patient = await _patientRepository.GetByIdAsync(dto.PatientId);
                    var staff = await _staffRepository.GetByIdAsync((int)dto.StaffId);
                    var doctorNotification = new Notification
                    {
                        AccountId = staff.AccountId,
                        Title = "Bệnh nhân đã đến",
                        Message = $"Bệnh nhân {patient.FullName} đã đến phòng khám [Mã LH: {appointment.Id}].",
                        Type = "appointment",
                        CreatedAt = DateTime.UtcNow,
                        IsRead = false
                    };
                    await _notificationRepository.AddAsync(doctorNotification);
                    await _notificationService.SendRealtimePush(doctorNotification);

                    // A. Kiểm tra xem bệnh nhân này đã có HSBN nào liên quan tới lịch hẹn này chưa
                    // B. Nếu chưa thì khi 'xác nhận đã đến' sẽ tạo mới HSBA, cập nhật pmrId vào lịch hẹn
                    if (appointment.PatientMedicalRecordId is null)
                    {
                        var medicalRecord = new PatientMedicalRecord
                        {
                            PatientId = dto.PatientId,
                            StaffId = (int)dto.StaffId!, // Nếu đã xác nhận thì chắc chắn có StaffId
                            RequiresTest = false,
                            CreateAt = DateTime.UtcNow,
                            Status = false // Chưa hoàn thành
                        };
                        await _medicalRecordRepository.AddAsync(medicalRecord);
                        await _unitOfWork.SaveChangeAsync(); // Save để cho nó sinh ra Id mới gán cho appointment đc

                        appointment.PatientMedicalRecordId = medicalRecord.Id;
                        _appointmentRepository.Update(appointment);
                    }
                    else
                    {
                        var medicalRecord = await _medicalRecordRepository.GetByIdAsync((int)appointment.PatientMedicalRecordId!);
                        
                        if (medicalRecord != null)
                        {
                            medicalRecord.Status = false; // Mở lại HSBA cho tái khám
                            _medicalRecordRepository.Update(medicalRecord);

                            appointment.Status = AppointmentStatus.CheckedIn;
                            _appointmentRepository.Update(appointment);
                        }    
                    }
                }

                ////// Trong quá trình khám (Bệnh nhân đã đến hoặc đang khám), nếu lỡ xảy ra gì đó mà muốn hủy khám đột ngột -> Xóa hồ sơ bệnh án

                if (dto.Status == AppointmentStatus.Cancelled 
                    && (appointment.Status == AppointmentStatus.CheckedIn || appointment.Status == AppointmentStatus.InProgress)
                    && appointment.PatientMedicalRecordId is not null)
                {
                    var medicalRecord = await _medicalRecordRepository.GetByIdAsync((int)appointment.PatientMedicalRecordId!);
                    if (medicalRecord != null)
                        _medicalRecordRepository.Delete(medicalRecord);
                }

                // Nếu trạng thái lịch hẹn ko phải 'Đã hủy', 'Đã hoàn thành', 'Không đến' -> cho phân công bác sĩ và update status
                if (dto.Status != AppointmentStatus.Cancelled 
                    || dto.Status != AppointmentStatus.Completed
                    || dto.Status != AppointmentStatus.NoShow)
                {
                    appointment.StaffId = dto.StaffId;
                    appointment.Status = dto.Status;
                    _appointmentRepository.Update(appointment);
                }
                await _unitOfWork.CommitAsync();
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }

            return _mapper.Map<AppointmentDto>(await _appointmentRepository.GetByIdAsync(dto.Id));
        }
    }
}
