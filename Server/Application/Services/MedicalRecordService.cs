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
        private readonly IRepository<Patient> _patientRepository;

        public MedicalRecordService(IRepository<PatientMedicalRecord> patientMedicalRecordRepository, IUnitOfWork unitOfWork, IMapper mapper, IAccountHelper accountHelper, IRepository<Staff> staffRepository, IInvoiceService invoiceService, IRepository<Appointment> appointmentRepository, IRepository<Invoice> invoiceRepository, IRepository<Patient> patientRepository)
        {
            _patientMedicalRecordRepository = patientMedicalRecordRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _accountHelper = accountHelper;
            _staffRepository = staffRepository;
            _invoiceService = invoiceService;
            _appointmentRepository = appointmentRepository;
            _invoiceRepository = invoiceRepository;
            _patientRepository = patientRepository;
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
                .Where(pmr => pmr.StaffId == staff.Id)
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
                await _unitOfWork.CommitAsync();
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
        }

        // Đặt lịch tái khám -> tính tiền thuốc
        // lúc này tạo lịch hẹn mới với status đã xác nhận và có pmr của HSBA hiện tại cùng tt lịch hẹn hiện tại
        public async Task ConfirmIsRevisit(int medicalRecordId, ConfirmIsRevisitAppointment confirmIsRevisitAppointment)
        {
            try
            {
                await _unitOfWork.BeginTransactionAsync();

                var medicalRecord = await _patientMedicalRecordRepository.GetByIdAsync(medicalRecordId);
                if (medicalRecord is null)
                    throw new NotFoundException($"Không tìm thấy Hồ sơ bệnh án với ID {medicalRecordId}");

                medicalRecord.Status = true;  // Tạm hoàn thành cho đến khi bệnh nhân đến Lễ tân cập nhật trạng thái lịch hẹn 'Đã đến' sẽ mở lại cho edit
                _patientMedicalRecordRepository.Update(medicalRecord);

                // Tìm tất cả lịch hẹn đc đánh dấu là tái khám theo HSBA 
                var appointmentChecks = await _appointmentRepository.GetAllAsync(a => 
                a.PatientMedicalRecordId == medicalRecordId 
                && a.Revisit == RevisitStatus.Revisit);
                // Nếu HSBA này đã có lịch tái khám thì -> thông báo
                if (appointmentChecks.Any())
                    throw new NotFoundException($"Bệnh nhân đã có lịch tái khám với hồ sơ bệnh án này, vui lòng kiểm tra");


                /*
                 * SELECT a.* FROm PatientMedicalRecord pd
                    INNER JOIN Appointment a ON pd.Id = a.PatientMedicalRecordId
                    where pd.Id = 1 AND a.Status = 3 (đang khám)
                */

                // Nếu HSBA này chưa có lịch tái khám thì:
                // Tìm lịch hẹn với HSBA hiện tại có trạng thái LH là đang khám (Tức là lần khám đầu tiên)
                var appointment = await (
                    from pmr in _patientMedicalRecordRepository.Query()
                    join a in _appointmentRepository.Query() on pmr.Id equals a.PatientMedicalRecordId
                    where pmr.Id == medicalRecordId && (a.Status == AppointmentStatus.InProgress)
                    select a
                    )
                    .OrderByDescending(a => a.Id) // Sắp xếp lịch hẹn mới nhất trước để nó lấy lịch hẹn mới thay vì lịch cũ
                    .FirstOrDefaultAsync();

                // Nếu có LH đang khám thì nó cập nhật trạng thái lịch sang đã hoàn thành và tạo 1 lịch mới với thông tin HSBA y hệt
                // Nếu không có LH đang khám -> trường hợp này ko bao giờ xảy ra vì khi bác sĩ nhập vô form HSBA là nó thành đang khám rồi, nhưng dùng if để tránh lỗi
                if (appointment is not null)
                {
                    // Đồng thời cập nhật lịch đang khám thành hoàn thành -> tạo lịch mới là đã xác nhận
                    appointment.Status = AppointmentStatus.Completed;
                    _appointmentRepository.Update(appointment);

                    // Đánh dấu lịch hẹn mới tạo là lịch tái khám
                    var appointmentNew = new Appointment
                    {
                        PatientId = appointment.PatientId,
                        StaffId = appointment.StaffId,
                        MedicalServiceId = appointment.MedicalServiceId,
                        PatientMedicalRecordId = medicalRecordId,
                        Revisit = RevisitStatus.Revisit,
                        Status = AppointmentStatus.Confirmed,
                        AppointmentDate = confirmIsRevisitAppointment.AppointmentDate,
                        AppointmentTime = confirmIsRevisitAppointment.AppointmentTime
                    };
                    await _appointmentRepository.AddAsync(appointmentNew);

                    // Tạo hóa đơn
                    var invoiceDto = new InvoiceDto
                    {
                        PatientMedicalRecordId = medicalRecordId,
                    };
                    await _invoiceService.AddAsync(invoiceDto);
                }

                // Nếu HSBA này chưa có lịch tái khám thì:
                // Tìm lịch hẹn với HSBA hiện tại có trạng thái LH là đã hoàn (Tức là lần tái khám đã khám xong và muốn đặt lịch lại) -> Lúc này ko tạo hóa đơn
                var appointmentRevisit = await (
                    from pmr in _patientMedicalRecordRepository.Query()
                    join a in _appointmentRepository.Query() on pmr.Id equals a.PatientMedicalRecordId
                    where pmr.Id == medicalRecordId && (a.Status == AppointmentStatus.Completed)
                    select a
                    )
                    .OrderByDescending(a => a.Id) // Sắp xếp lịch hẹn mới nhất trước để nó lấy lịch hẹn mới thay vì lịch cũ
                    .FirstOrDefaultAsync();

                // Nếu có LH đang khám thì nó cập nhật trạng thái lịch sang đã hoàn thành và tạo 1 lịch mới với thông tin HSBA y hệt
                // Nếu không có LH đang khám -> trường hợp này ko bao giờ xảy ra vì khi bác sĩ nhập vô form HSBA là nó thành đang khám rồi, nhưng dùng if để tránh lỗi
                if (appointmentRevisit is not null)
                {
                    // Đánh dấu lịch hẹn mới tạo là lịch tái khám
                    var appointmentRevisitNew = new Appointment
                    {
                        PatientId = appointmentRevisit.PatientId,
                        StaffId = appointmentRevisit.StaffId,
                        MedicalServiceId = appointmentRevisit.MedicalServiceId,
                        PatientMedicalRecordId = medicalRecordId,
                        Revisit = RevisitStatus.Revisit,
                        Status = AppointmentStatus.Confirmed,
                        AppointmentDate = confirmIsRevisitAppointment.AppointmentDate,
                        AppointmentTime = confirmIsRevisitAppointment.AppointmentTime
                    };
                    await _appointmentRepository.AddAsync(appointmentRevisitNew);
                }

                await _unitOfWork.CommitAsync();
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
        }

        // Xác nhận hoàn thành tái khám
        public async Task ConfirmCompletedRevisit(int medicalRecordId)
        {
            try
            {
                await _unitOfWork.BeginTransactionAsync();

                var medicalRecord = await _patientMedicalRecordRepository.GetByIdAsync(medicalRecordId);
                if (medicalRecord is null)
                    throw new NotFoundException($"Không tìm thấy Hồ sơ bệnh án với ID {medicalRecordId}");

                // tìm hóa đơn theo HSBA chưa đc thanh toán
                var invoice = await _invoiceRepository.GetAsync(i =>
                    i.PatientMedicalRecordId == medicalRecord.Id
                    && i.Status == false);
                if (invoice is not null)
                    throw new ErrorException("Bệnh nhân chưa thanh toán hóa đơn cho lần khám trước đó, liên hệ lễ tân để thanh toán");

                // Tìm lịch hẹn đang khám
                var appointment = await _appointmentRepository.GetAsync(a => 
                    a.PatientMedicalRecordId == medicalRecordId 
                    && a.Status == AppointmentStatus.InProgress);
                if (appointment is null)
                    throw new NotFoundException($"Không tìm thấy lịch hẹn với ID {medicalRecordId}");

                appointment.Revisit = RevisitStatus.Completed;
                appointment.Status = AppointmentStatus.Completed;
                _appointmentRepository.Update(appointment);

                medicalRecord.Status = true;
                _patientMedicalRecordRepository.Update(medicalRecord);

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

            // tìm hóa đơn theo HSBA chưa đc thanh toán
            var invoice = await _invoiceRepository.GetAsync(i =>
                i.PatientMedicalRecordId == medicalRecord.Id
                && i.Status == false);
            if (invoice is not null)
                throw new ErrorException("Bệnh nhân chưa thanh toán hóa đơn cho lần khám trước đó, liên hệ lễ tân để thanh toán");

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

        public async Task<IEnumerable<PatientMedicalRecordDto>> GetAllMedicalRecordByPatient()
        {
            var accountId = await _accountHelper.GetAccountId();
            var patient = await _patientRepository.GetAsync(s => s.AccountId == accountId);

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
                .Where(pmr => pmr.PatientId == patient.Id)
                .Distinct()
                .ToListAsync();
            return _mapper.Map<IEnumerable<PatientMedicalRecordDto>>(medicalRecord);
        }
    }
}
