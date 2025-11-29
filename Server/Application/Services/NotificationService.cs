using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class NotificationService : IService<NotificationDto>
    {
        private readonly IRepository<Notification> _repository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAccountHelper _accountHelper;

        public NotificationService(IRepository<Notification> repository, IMapper mapper, IUnitOfWork unitOfWork, IAccountHelper accountHelper)
        {
            _repository = repository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _accountHelper = accountHelper;
        }

        public Task<NotificationDto> AddAsync(NotificationDto dto)
        {
            throw new NotImplementedException();
        }

        public Task Delete(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<NotificationDto>> GetAllAsync()
        {
            var accountId = await _accountHelper.GetAccountId();
            
            return _mapper.Map<IEnumerable<NotificationDto>>(await _repository.Query().Where(x => x.AccountId == accountId).OrderByDescending(x => x.Id).ToListAsync());
        }

        public Task<NotificationDto> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<NotificationDto> Update(NotificationDto dto)
        {
            var notification = await _repository.GetByIdAsync(dto.Id);
            if (notification is null)
                throw new NotFoundException("Không tìm thấy thông báo, không thể cập nhật.");

            notification.IsRead = true;

            _repository.Update(notification);
            await _unitOfWork.SaveChangeAsync();
            return dto;
        }
    }
}
