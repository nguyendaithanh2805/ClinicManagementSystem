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

        public AppointmentService(IRepository<Appointment> appointmentRepository, IUnitOfWork unitOfWork, IMapper mapper, IAccountHelper accountHelper, IRepository<Invoice> invoiceRepository, IInvoiceService invoiceService, IRepository<Patient> patientRepository, IRepository<Staff> staffRepository, IMedicalRecordService medicalRecordService, IRepository<Account> accountRepository, IRepository<PatientMedicalRecord> medicalRecordRepository)
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
        }

        public async Task<AppointmentDto> AddAsync(AppointmentDto dto)
        {
            var accountId = await _accountHelper.GetAccountId();
            var patient = await _patientRepository.GetAsync(p => p.AccountId == accountId);
            
            var appointment = await _appointmentRepository.GetAsync(a => a.PatientId == patient.Id && a.Status == AppointmentStatus.Pending);
            if (appointment is not null && 
                appointment.AppointmentDate == dto.AppointmentDate && 
                appointment.AppointmentTime == dto.AppointmentTime)
                throw new AlreadyExistsException("Bạn có một lịch hẹn tương tự đang chờ xác nhận");

            try
            {
                await _unitOfWork.BeginTransactionAsync();

                dto.PatientId = patient.Id;
                dto.Status = AppointmentStatus.Pending;
                dto.IsRevisit = false; // Mặc định là không tái khám
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

            //if (appointment.Status == AppointmentStatus.Confirmed && 
            //    dto.StaffId != appointment.StaffId && 
            //    dto.Status != AppointmentStatus.Cancelled)
            //    throw new Exception("Lịch hẹn này đã xác nhận, không thể thay đổi bác sĩ.");

            if (appointment.Status == AppointmentStatus.Pending 
                && dto.StaffId is null)
                throw new ErrorException("Vui lòng phân công bác sĩ cho lịch hẹn này");

            try
            {
                await _unitOfWork.BeginTransactionAsync();

                /* Chỉ tạo Hồ sơ Bệnh án khi trạng thái cũ là 'Đã xác nhận' và trạng thái mới là 'Bệnh nhân đã đến'
                 *
                 * Mục đích của việc này là để khi Update lại Bác sĩ nếu phân công nhầm nhưng lịch hẹn đã xác nhận rồi thì nó không tạo Hồ sơ Bệnh án nữa
                */
                if (appointment.Status == AppointmentStatus.Confirmed &&
                    dto.Status == AppointmentStatus.CheckedIn)
                {
                    var medicalRecord = new PatientMedicalRecordDto
                    {
                        PatientId = dto.PatientId,
                        StaffId = (int)dto.StaffId!, // Nếu đã xác nhận thì chắc chắn có StaffId
                        RequiresTest = false
                    };
                    await _medicalRecordService.AddAsync(medicalRecord);
                }

                //// Lịch hẹn đã xác nhận thì tạo hóa đơn tạm

                //if (dto.Status == AppointmentStatus.Confirmed)
                //{
                //    var invoice = new InvoiceDto
                //    {
                //        AppointmentId = appointment.Id,
                //    };
                //    await _invoiceService.AddAsync(invoice);
                //}

                //// Trong quá trình khám (Bệnh nhân đã đến), nếu lỡ xảy ra gì đó mà muốn hủy khám -> Xóa hồ sơ bệnh án

                //if (dto.Status == AppointmentStatus.Cancelled
                //    && appointment.Status == AppointmentStatus.CheckedIn)
                //{
                //    var medicalRecord = await _medicalRecordRepository.GetByIdAsync((int)appointment.PatientMedicalRecordId!);
                //    if (medicalRecord != null)
                //        _medicalRecordRepository.Delete(medicalRecord);
                //}

                /*
                    * Bác sĩ truyền từ FE khác với Bác sĩ đã được phân công của lịch (tức là repcep phân công nhầm Bác sĩ cho lịch hẹn)
                    * Nếu trạng thái lịch hẹn ko phải là 'Đã hủy' hoặc 'Đã hoàn thành' thì cho Update trạng thái.
                    * 
                */
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
