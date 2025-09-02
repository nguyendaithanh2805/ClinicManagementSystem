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

        public AppointmentService(IRepository<Appointment> appointmentRepository, IUnitOfWork unitOfWork, IMapper mapper, IAccountHelper accountHelper)
        {
            _appointmentRepository = appointmentRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _accountHelper = accountHelper;
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

        public void Delete(int id)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<AppointmentDto>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<AppointmentDto> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public void Update(AppointmentDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
