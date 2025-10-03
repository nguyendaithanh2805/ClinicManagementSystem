using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface ISymptomService : IService<SymptomDto>
    {
        Task<IEnumerable<SymptomDto>> GetAllByMedicalRecordAsync(int MedicalRecordId);
    }
}
