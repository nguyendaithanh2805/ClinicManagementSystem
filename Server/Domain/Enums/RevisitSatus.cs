using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Enums
{
    public enum RevisitStatus
    {
        None = 0,            // Không tái khám
        Revisit = 1,        // Tái khám
        Completed = 2        // Hoàn thành tái khám
    }

}
