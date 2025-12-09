using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class PrescriptionService : IService<PrescriptionDto>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRepository<Prescription> _repository;

        public PrescriptionService(IUnitOfWork unitOfWork, IRepository<Prescription> repository)
        {
            _unitOfWork = unitOfWork;
            _repository = repository;
        }

        public Task<PrescriptionDto> AddAsync(PrescriptionDto dto)
        {
            throw new NotImplementedException();
        }

        public async Task Delete(int id)
        {
            var prescription = await _repository.GetByIdAsync(id);
            if (prescription is null)
                throw new NotFoundException($"Not found prescription with ID {id}");

            _repository.Delete(prescription);
            await _unitOfWork.SaveChangeAsync();
        }

        public Task<IEnumerable<PrescriptionDto>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<PrescriptionDto> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<PrescriptionDto> Update(PrescriptionDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
