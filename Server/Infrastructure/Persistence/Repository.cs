using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence
{
    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly ClinicContext _context;
        private readonly DbSet<T> _dbSet;

        public Repository(ClinicContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        public async Task AddAsync(T entity)
            => await _dbSet.AddAsync(entity);


        public void Delete(T entity)
            => _dbSet.Remove(entity);

        public async Task<IEnumerable<T>> GetAllAsync()
            => await _dbSet.ToListAsync();

        public async Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>> expression)
            => await _dbSet.Where(expression).ToListAsync();

        public async Task<T> GetAsync(Expression<Func<T, bool>> expression)
            => await _dbSet.FirstOrDefaultAsync(expression);

        public async Task<T> GetByIdAsync(int id)
            => await _dbSet.FindAsync(id);

        public IQueryable<T> Query()
            => _dbSet.AsQueryable();

        public void Update(T entity)
            => _dbSet.Update(entity);
    }
}
