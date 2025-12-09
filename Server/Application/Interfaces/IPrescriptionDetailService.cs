using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IPrescriptionDetailService : IService<PrescriptionDetailDto>
    {
        Task Delete(int prescriptionId, int medicineId);
        Task<PrescriptionDetailDto> Update(PrescriptionDetailDto dto, int medicineId);
    }
}
