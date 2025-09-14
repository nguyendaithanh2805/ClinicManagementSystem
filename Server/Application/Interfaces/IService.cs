using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IService <TDto> where TDto : class
    {
        Task<IEnumerable<TDto>> GetAllAsync();
        Task<TDto> GetByIdAsync(int id);
        Task<TDto> AddAsync(TDto dto);
        Task<TDto> Update(TDto dto);
        Task Delete(int id);
    }
}
