using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IMedicalRecordService : IService<PatientMedicalRecordDto>
    {
        Task<IEnumerable<PatientMedicalRecordDto>> GetAllByDoctorAsync();
        Task<IEnumerable<PatientMedicalRecordDto>> GetAllForLabTechnicianAsync();
        Task ConfirmInProgress(int medicalRecordId);
        Task ConfirmCompleted(int medicalRecordId);
        Task ConfirmCompletedRevisit(int medicalRecordId);
        Task ConfirmIsRevisit(int medicalRecordId, ConfirmIsRevisitAppointment confirmIsRevisitAppointment);
        Task<IEnumerable<PatientMedicalRecordDto>> GetAllMedicalRecordByPatient();
    }
}
