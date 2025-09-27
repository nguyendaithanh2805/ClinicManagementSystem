using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;

namespace Application.Services
{
    public interface IInvoiceService : IService<InvoiceDto>
    {
        Task<InvoiceDto> UpdateStatus(InvoiceStatusDto status);
    }
}
