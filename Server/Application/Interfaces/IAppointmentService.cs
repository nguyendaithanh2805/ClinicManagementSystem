using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IAppointmentService : IService<AppointmentDto>
    {
        Task<IEnumerable<AppointmentDto>> GetByDoctorAsync();
        Task<IEnumerable<AppointmentDto>> GetAllAppointmentByPatient();
    }
}
