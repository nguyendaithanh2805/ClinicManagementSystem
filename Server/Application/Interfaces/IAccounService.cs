using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IAccounService : IService<AccountDto>
    {
        Task<AccountDto> GetByUsername(string username);
    }
}
