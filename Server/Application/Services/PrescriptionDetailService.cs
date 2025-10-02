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

        /// <summary>
        /// Thêm chi tiết toa thuốc và cập nhật hóa đơn liên quan.
        /// </summary>
        /// /// <remarks>
        /// Quy trình:
        /// 1. Kiểm tra thuốc tồn tại.
        /// 2. Tạo mới Prescription (toa thuốc).
        /// 3. Lưu Prescription và lấy Id.
        /// 4. Tính toán thành tiền (Amount = Quantity * Price).
        /// 5. Thêm PrescriptionDetail.
        /// 6. Truy vấn hóa đơn (Invoice) thông qua quan hệ Patient → Appointment → PatientMedicalRecord → Invoice.
        /// 7. Cộng dồn TotalAmount của Invoice.
        /// 8. Lưu thay đổi bằng UnitOfWork (Commit).
        /// Nếu có lỗi sẽ rollback.
        /// </remarks>
        public async Task<PrescriptionDetailDto> AddAsync(PrescriptionDetailDto dto)
        {
            var medicine = await _medicineRepository.GetByIdAsync(dto.MedicineId);
            if (medicine is null)
                throw new NotFoundException($"Không tìm thấy thuốc với ID {dto.MedicineId}");

            try
            {
                await _unitOfWork.BeginTransactionAsync();

                var vnTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                var prescription = new Prescription
                {
                    PrescriptionDate = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vnTimeZone),
                    PatientMedicalRecordId = (int)dto.PatientMedicalRecordId!
                };
                await _prescriptionRepository.AddAsync(prescription);
                await _unitOfWork.SaveChangeAsync();

                dto.PrescriptionId = prescription.Id;
                dto.Amount = dto.Quantity * medicine.Price;
                await _prescriptionDetailRepository.AddAsync(_mapper.Map<PrescriptionDetail>(dto));

                // Lấy invoice tương ứng với Prescription hiện tại:
                // - Join từ Patient → Appointment → PatientMedicalRecord → Invoice
                // - Chỉ lấy các Appointment đã Confirmed
                // - Ràng buộc đúng PatientMedicalRecord của Prescription
                // - Dùng FirstOrDefault() để lấy 1 hóa đơn
                /*SELECT i.Id FROM Patient p
                INNER JOIN Appointment a ON p.Id = a.PatientId
                INNER JOIN PatientMedicalRecord pmr ON p.Id = pmr.PatientId
                INNER JOIN Invoice i ON a.Id = i.AppointmentId
                WHERE a.Status = 1 AND pmr.Id = 1*/
                var invoice = (
                    from p in _patientRepository.Query()
                    join a in _appointmentRepository.Query() on p.Id equals a.PatientId
                    join pmr in _patientMedicalRecordRepository.Query() on p.Id equals pmr.PatientId
                    join i in _invoiceRepository.Query() on a.Id equals i.AppointmentId
                    where a.Status == AppointmentStatus.Confirmed && pmr.Id == prescription.PatientMedicalRecordId
                    select i
                    ).Distinct().FirstOrDefault();

                invoice!.TotalAmount += dto.Amount;
                _invoiceRepository.Update(invoice!);
                
                await _unitOfWork.CommitAsync();
            } catch
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

                var prescription = await _prescriptionRepository.GetByIdAsync(prescriptionId);
                if (prescriptionDetail is null)
                    throw new NotFoundException($"Không tìm thấy đơn thuốc với ID {prescriptionId}");
                _prescriptionRepository.Delete(prescription);

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

        public async Task<PrescriptionDetailDto> Update(PrescriptionDetailDto dto)
        {
            var prescriptionDetail = await _prescriptionDetailRepository.GetAsync(p => p.PrescriptionId == dto.PrescriptionId && p.MedicineId == dto.MedicineId);
            var presciption = await _prescriptionRepository.GetByIdAsync(dto.PrescriptionId);
            var medicine = await _medicineRepository.GetByIdAsync(dto.MedicineId);
            try
            {
                presciption.PrescriptionDate = DateTime.UtcNow;
                _prescriptionRepository.Update(presciption);

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
    }
}
