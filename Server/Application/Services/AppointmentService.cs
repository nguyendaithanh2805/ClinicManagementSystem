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

namespace Application.Services
{
    public class AppointmentService : IService<AppointmentDto>
    {
        private readonly IRepository<Appointment> _appointmentRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IAccountHelper _accountHelper;
        private readonly IRepository<Invoice> _invoiceRepository;

        public AppointmentService(IRepository<Appointment> appointmentRepository, IUnitOfWork unitOfWork, IMapper mapper, IAccountHelper accountHelper, IRepository<Invoice> invoiceRepository)
        {
            _appointmentRepository = appointmentRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _accountHelper = accountHelper;
            _invoiceRepository = invoiceRepository;
        }

        public async Task<AppointmentDto> AddAsync(AppointmentDto dto)
        {
            dto.PatientId = _accountHelper.GetAccountId();
            dto.Status = AppointmentStatus.Pending;

            var appointment = await _appointmentRepository.GetAsync(a => a.PatientId == dto.PatientId);
            if (appointment is not null)
                throw new AlreadyExistsException("Bạn có một lịch hẹn đang chờ xử lý");

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

        public Task<IEnumerable<AppointmentDto>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<AppointmentDto> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<AppointmentDto> Update(AppointmentDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
