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
    public class AppointmentService : IService<AppointmentDto>
    {
        private readonly IRepository<Appointment> _appointmentRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IAccountHelper _accountHelper;
        private readonly IRepository<Invoice> _invoiceRepository;
        private readonly IService<InvoiceDto> _invoiceService;
        private readonly IRepository<Patient> _patientRepository;

        public AppointmentService(IRepository<Appointment> appointmentRepository, IUnitOfWork unitOfWork, IMapper mapper, IAccountHelper accountHelper, IRepository<Invoice> invoiceRepository, IService<InvoiceDto> invoiceService, IRepository<Patient> patientRepository)
        {
            _appointmentRepository = appointmentRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _accountHelper = accountHelper;
            _invoiceRepository = invoiceRepository;
            _invoiceService = invoiceService;
            _patientRepository = patientRepository;
        }

        public async Task<AppointmentDto> AddAsync(AppointmentDto dto)
        {
            var patient = await _patientRepository.GetAsync(p => p.AccountId == _accountHelper.GetAccountId());
            
            var appointment = await _appointmentRepository.GetAsync(a => a.PatientId == patient.Id);
            if (appointment is not null)
                throw new AlreadyExistsException("Bạn có một lịch hẹn đang chờ xử lý");
            
            dto.PatientId = patient.Id;
            dto.Status = AppointmentStatus.Pending;

            await _appointmentRepository.AddAsync(
                _mapper.Map<Appointment>(dto));
            await _unitOfWork.SaveChangeAsync();
            return dto;
        }

        public async Task Delete(int id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment is null)
                throw new NotFoundException($"Không tìm thấy lịch hẹn với ID {id}");

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

        public async Task<IEnumerable<AppointmentDto>> GetAllAsync()
        {

            return _mapper.Map<IEnumerable<AppointmentDto>>(
                await _appointmentRepository.Query()
                .Include(a => a.Patient)
                .Include(a => a.Staff)
                .Include(a => a.MedicalService)
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
                throw new NotFoundException("Không tìm thấy lịch hẹn, không thể cập nhật.");

            if (appointment.Status == AppointmentStatus.Completed)
                throw new Exception("Lịch hẹn này đã hoàn thành, không thể thay đổi trạng thái");

            if (appointment.Status == AppointmentStatus.Cancelled)
                throw new Exception("Lịch hẹn này đã bị hủy, không thể thay đổi trạng thái");

            if (dto.Status == AppointmentStatus.Cancelled && 
                dto.StaffId != appointment.StaffId)
                throw new Exception("Không thay đổi bác sĩ cho lịch hẹn đánh dấu trạng thái là hủy");

            if (appointment.Status == AppointmentStatus.Confirmed && 
                dto.StaffId != appointment.StaffId && 
                dto.Status != AppointmentStatus.Cancelled)
                throw new Exception("Lịch hẹn này đã xác nhận, không thể thay đổi bác sĩ.");

            if (appointment.Status == AppointmentStatus.Pending &&
                dto.StaffId is null)
                throw new Exception("Vui lòng phân công bác sĩ cho lịch hẹn này");

            if (appointment.Status == AppointmentStatus.Pending && 
                dto.Status != AppointmentStatus.Confirmed)
                throw new Exception("Bạn phải 'xác nhận' lịch hẹn trước tiên");

            try
            {
                await _unitOfWork.BeginTransactionAsync();

                appointment.StaffId = dto.StaffId;
                appointment.Status = dto.Status;

                if (dto.Status == AppointmentStatus.Completed)
                {
                    var invoice = new InvoiceDto
                    {
                        AppointmentId = appointment.Id,
                    };
                    await _invoiceService.AddAsync(invoice);
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
