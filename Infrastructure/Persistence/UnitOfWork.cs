using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Infrastructure.Persistence
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ClinicContext _dbContext;
        private IDbContextTransaction _transaction;

        public UnitOfWork(ClinicContext linicContext)
        {
            _dbContext = linicContext;
        }

        public async Task BeginTransactionAsync()
        {
            if (_transaction is null)
                _transaction = await _dbContext.Database.BeginTransactionAsync();
        }

        public async Task CommitAsync()
        {
            try
            {
                await _dbContext.SaveChangesAsync();
                if (_transaction is not null)
                    await _transaction.CommitAsync();
            } 
            catch
            {
                await RollbackAsync();
            } 
            finally
            {
                if ( _transaction is not null)
                {
                    await _transaction.DisposeAsync();
                    _transaction = null;
                }
            }
        }

        public void Dispose()
        {
            _dbContext.Dispose();
        }

        public async Task RollbackAsync()
        {
            if (_transaction is not null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task<int> SaveChangeAsync()
        {
            return await _dbContext.SaveChangesAsync();
        }
    }
}
