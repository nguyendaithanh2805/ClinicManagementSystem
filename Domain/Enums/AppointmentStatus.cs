using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Enums
{
    public enum AppointmentStatus
    {
        Pending = 0,      // Chờ xác nhận
        Confirmed = 1,    // Đã xác nhận
        Cancelled = 2,    // Đã hủy
        Completed = 3     // Đã hoàn thành
    }
}
