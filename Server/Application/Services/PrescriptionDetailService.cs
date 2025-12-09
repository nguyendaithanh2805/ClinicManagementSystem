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
    public class PrescriptionDetailService : IPrescriptionDetailService
    {
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRepository<Prescription> _prescriptionRepository;
        private readonly IRepository<PrescriptionDetail> _prescriptionDetailRepository;
        private readonly IRepository<Medicine> _medicineRepository;
        private readonly IRepository<Patient> _patientRepository;
        private readonly IRepository<Appointment> _appointmentRepository;
        private readonly IRepository<PatientMedicalRecord> _patientMedicalRecordRepository;
        private readonly IRepository<Invoice> _invoiceRepository;

        public PrescriptionDetailService(IMapper mapper, IUnitOfWork unitOfWork, IRepository<Prescription> prescriptionRepository, IRepository<PrescriptionDetail> prescriptionDetailRepository, IRepository<Medicine> medicineRepository, IRepository<Patient> patientRepository, IRepository<Appointment> appointmentRepository, IRepository<PatientMedicalRecord> patientMedicalRecordRepository, IRepository<Invoice> invoiceRepository)
        {
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _prescriptionRepository = prescriptionRepository;
            _prescriptionDetailRepository = prescriptionDetailRepository;
            _medicineRepository = medicineRepository;
            _patientRepository = patientRepository;
            _appointmentRepository = appointmentRepository;
            _patientMedicalRecordRepository = patientMedicalRecordRepository;
            _invoiceRepository = invoiceRepository;
        }

        public async Task<PrescriptionDetailDto> AddAsync(PrescriptionDetailDto dto)
        {
            var medicine = await _medicineRepository.GetByIdAsync(dto.MedicineId);
            if (medicine is null)
                throw new NotFoundException($"Không tìm thấy thuốc với ID {dto.MedicineId}");

            var medicalRecord = await _patientMedicalRecordRepository.GetByIdAsync((int)dto.PatientMedicalRecordId!);
            if (medicalRecord is not null)
                if (medicalRecord.Status == true)
                    throw new AlreadyExistsException("Lịch hẹn đã hoàn thành không thể thao tác");

            try
            {
                await _unitOfWork.BeginTransactionAsync();

                // Tìm xem đơn thuốc ngày hôm nay theo HSBA của bệnh nhân đã có đơn nào chưa hoàn thành hay ko,
                // Nếu ko có thì tạo mới đơn thuốc và CT đơn thuốc
                // Nếu đã có thì tạo mới CT đơn và cập nhật tgian kê đơn
                var prescription = await _prescriptionRepository.Query()
                    .FirstOrDefaultAsync(p =>
                        p.PatientMedicalRecordId == dto.PatientMedicalRecordId
                        && p.PrescriptionDate.Date == DateTime.UtcNow.Date
                        && p.IsCompleted == false);

                if (prescription is null)
                {
                    var Appointment = await (
                        from a in _appointmentRepository.Query()
                        join pmr in _patientMedicalRecordRepository.Query() on a.PatientMedicalRecordId equals pmr.Id
                        where pmr.Id == dto.PatientMedicalRecordId
                        select a
                    ).OrderByDescending(a => a.Id)
                    .FirstOrDefaultAsync();
                    if (Appointment is not null)
                    {
                        var newPres = new Prescription
                        {
                            PrescriptionDate = DateTime.UtcNow,
                            PatientMedicalRecordId = (int)dto.PatientMedicalRecordId!,
                            AppointmentId = Appointment.Id,
                            IsCompleted = false
                        };
                        await _prescriptionRepository.AddAsync(newPres);
                        await _unitOfWork.SaveChangeAsync();
                        // Thêm chi tiết đơn thuốc với prescriptionId mới (1-N)
                        var prescriptionDetail = new PrescriptionDetail
                        {
                            PrescriptionId = newPres.Id,
                            MedicineId = dto.MedicineId,
                            Quantity = dto.Quantity,
                            Dosage = dto.Dosage,
                            Frequency = dto.Frequency,
                            Amount = dto.Quantity * medicine.Price
                        };
                        await _prescriptionDetailRepository.AddAsync(prescriptionDetail);
                    }
                }
                else
                {
                    // Kiểm tra xem thuốc đc kê đơn chưa
                    var medicineCheckExist = await _prescriptionDetailRepository.GetAsync(pd =>
                    pd.MedicineId == dto.MedicineId && pd.PrescriptionId == prescription.Id);

                    if (medicineCheckExist is not null)
                        throw new AlreadyExistsException($"Thuốc {medicine.Name} đã được kê đơn, vui lòng xóa đơn đã kê.");

                    prescription.PrescriptionDate = DateTime.UtcNow;
                    _prescriptionRepository.Update(prescription);

                    // Thêm chi tiết đơn thuốc với prescriptionId hiện tại (1-N)
                    var prescriptionDetail = new PrescriptionDetail
                    {
                        PrescriptionId = prescription.Id,
                        MedicineId = dto.MedicineId,
                        Quantity = dto.Quantity,
                        Dosage = dto.Dosage,
                        Frequency = dto.Frequency,
                        Amount = dto.Quantity * medicine.Price
                    };
                    await _prescriptionDetailRepository.AddAsync(prescriptionDetail);
                };


                await _unitOfWork.CommitAsync();
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
            return dto;
        }

        public async Task Delete(int prescriptionId, int medicineId)
        {
            var prescriptionDetail = await _prescriptionDetailRepository
                .GetAsync(p => p.PrescriptionId == prescriptionId &&
                p.MedicineId == medicineId);
            if (prescriptionDetail is null)
                throw new NotFoundException($"Không tìm thấy chi tiết đơn thuốc với PrescriptionId: {prescriptionId} và MedicineId: {medicineId}");

            try
            {
                await _unitOfWork.BeginTransactionAsync();
                _prescriptionDetailRepository.Delete(prescriptionDetail);

                //var prescription = await _prescriptionRepository.GetByIdAsync(prescriptionId);
                //if (prescriptionDetail is null)
                //    throw new NotFoundException($"Không tìm thấy đơn thuốc với ID {prescriptionId}");
                //_prescriptionRepository.Delete(prescription);

                await _unitOfWork.CommitAsync();
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
        }

        public Task Delete(int id)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<PrescriptionDetailDto>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<PrescriptionDetailDto> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<PrescriptionDetailDto> Update(PrescriptionDetailDto dto, int medicineId)
        {
            var prescriptionDetail = await _prescriptionDetailRepository.GetAsync(p => p.PrescriptionId == dto.PrescriptionId && p.MedicineId == medicineId);
            if (prescriptionDetail is null)
                throw new NotFoundException($"Không tìm thấy chi tiết đơn thuốc với PrescriptionId {dto.PrescriptionId} và MedicineId {medicineId}");
            var presciption = await _prescriptionRepository.GetByIdAsync(dto.PrescriptionId);
            var medicine = await _medicineRepository.GetByIdAsync(dto.MedicineId);
            try
            {
                presciption.PrescriptionDate = DateTime.UtcNow;
                _prescriptionRepository.Update(presciption);

                prescriptionDetail.MedicineId = dto.MedicineId;
                prescriptionDetail.Quantity = dto.Quantity;
                prescriptionDetail.Dosage = dto.Dosage;
                prescriptionDetail.Frequency = dto.Frequency;
                prescriptionDetail.Amount = dto.Quantity * medicine.Price; ;

                _prescriptionDetailRepository.Update(prescriptionDetail);
                await _unitOfWork.CommitAsync();
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
            return dto;
        }

        public Task<PrescriptionDetailDto> Update(PrescriptionDetailDto dto)
        {
            throw new NotImplementedException();
        }
    }
}