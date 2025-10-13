using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IPatientService : IService<PatientDto>
    {
        public Task<IEnumerable<PatientWithAccountDto>> GetAllWithAccountAsync();
        public Task<PatientWithAccountDto> AddPatientWithAccountAsync(PatientWithAccountDto dto);
        public Task<IEnumerable<PatientMedicalRecordDto>> GetAllMedicalRecordByPatient();
        public Task<PatientDto> GetPatientByIdIncludeAccount();
        public Task UpdatePatientAccount(PatientWithAccountDto dto);
        Task UpdatePasswordForPatientAccountAsync(ChangePasswordDto dto);
    }
}
