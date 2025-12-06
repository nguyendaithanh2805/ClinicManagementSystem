using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;
using Microsoft.AspNetCore.Http;

namespace Application.Interfaces
{
    public interface IPaymentService
    {
        string CreateVnPayPaymentUrl(int invoiceId, decimal amount, string ipAddress);
        Task<VnPayIpnResponse> ProcessVnPayIpn(IQueryCollection collections);
        Task<PaymentReturnDto> ProcessVnPayReturnUrl(IQueryCollection collections);
    }
}
