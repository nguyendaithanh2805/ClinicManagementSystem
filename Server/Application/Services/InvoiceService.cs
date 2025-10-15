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

        public InvoiceService(IRepository<Invoice> invoiceRepository, IMapper mapper, IUnitOfWork unitOfWork, IRepository<Appointment> appointmentRepository, IRepository<MedicalService> medicalServiceRepository, IAccountHelper accountHelper, IRepository<Patient> patientRepository)
        {
            _invoiceRepository = invoiceRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _appointmentRepository = appointmentRepository;
            _medicalServiceRepository = medicalServiceRepository;
            _accountHelper = accountHelper;
            _patientRepository = patientRepository;
        }

        public async Task<InvoiceDto> AddAsync(InvoiceDto dto)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(dto.AppointmentId);
            var medicalService = await _medicalServiceRepository.GetByIdAsync(appointment.MedicalServiceId);

            dto.Status = false; // Unpaid
            dto.TotalAmount = medicalService.Cost;
            dto.PaymentDate = DateTime.UtcNow;

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
                    .ThenInclude(a => a.Patient)
                .Include(i => i.Appointment)
                    .ThenInclude(a => a.MedicalService)
                .Include(i => i.Prescription)
                    .ThenInclude(p => p.PrescriptionDetails)
                    .ThenInclude(p => p.Medicine)
                .ToListAsync());
        }

        public async Task<IEnumerable<InvoiceDto>> GetAllInvoiceByPatient()
        {
            var accountId = await _accountHelper.GetAccountId();
            var patient = await _patientRepository.GetAsync(s => s.AccountId == accountId);

            return _mapper.Map<IEnumerable<InvoiceDto>>(await _invoiceRepository.Query()
                .Include(i => i.Appointment)
                    .ThenInclude(a => a.MedicalService)
                .Include(i => i.Prescription)
                    .ThenInclude(p => p.PrescriptionDetails)
                        .ThenInclude(pd => pd.Medicine)
                .Where(i => i.Appointment.PatientId == patient.Id)
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
