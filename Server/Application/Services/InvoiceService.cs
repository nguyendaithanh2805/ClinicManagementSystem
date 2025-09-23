using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class InvoiceService : IService<InvoiceDto>
    {
        private readonly IRepository<Invoice> _invoiceRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRepository<Appointment> _appointmentRepository;
        private readonly IRepository<MedicalService> _medicalServiceRepository;

        public InvoiceService(IRepository<Invoice> invoiceRepository, IMapper mapper, IUnitOfWork unitOfWork, IRepository<Appointment> appointmentRepository, IRepository<MedicalService> medicalServiceRepository)
        {
            _invoiceRepository = invoiceRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _appointmentRepository = appointmentRepository;
            _medicalServiceRepository = medicalServiceRepository;
        }

        public async Task<InvoiceDto> AddAsync(InvoiceDto dto)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(dto.AppointmentId);
            var medicalService = await _medicalServiceRepository.GetByIdAsync(appointment.MedicalServiceId);

            dto.Status = false; // Unpaid
            dto.TotalAmount = medicalService.Cost;

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
            return _mapper.Map<IEnumerable<InvoiceDto>>(await _invoiceRepository.Query()
                .Include(i => i.Appointment)
                .Include(i => i.Prescription).ToListAsync());

        }

        public Task<InvoiceDto> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<InvoiceDto> Update(InvoiceDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
