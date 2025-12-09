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
        CheckedIn = 2,    // Bệnh nhân đã đến
        InProgress = 3,   // Đang khám
        Completed = 4,    // Đã hoàn thành (ko thể dùng lại HSBA)
        Cancelled = 5,    // Đã hủy
        NoShow = 6        // Không đến
    }
}
