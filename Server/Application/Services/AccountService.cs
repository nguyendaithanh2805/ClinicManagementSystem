using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;

namespace Application.Services
{
    public class AccountService :IAccounService
    {
        private readonly IRepository<Account> _accountRepository;
        private readonly IMapper _mapper;

        public AccountService(IRepository<Account> accountRepository, IMapper mapper)
        {
            _accountRepository = accountRepository;
            _mapper = mapper;
        }

        public async Task<AccountDto> AddAsync(AccountDto dto)
        {
            await _accountRepository.AddAsync(_mapper.Map<Account>(dto));
            return dto;
        }

        public async Task Delete(int id)
        {
            var account = await _accountRepository.GetByIdAsync(id);
            if (account is null)
                throw new NotFoundException("Không tìm thấy tài khoản, không thể xóa.");

            _accountRepository.Delete(account);
        }

        public async Task<IEnumerable<AccountDto>> GetAllAsync()
        {
            return _mapper.Map<IEnumerable<AccountDto>>(
                await _accountRepository.GetAllAsync());
        }

        public async Task<AccountDto> GetByIdAsync(int id)
        {
            var account = await _accountRepository.GetByIdAsync(id);
            if (account is null)
                throw new NotFoundException($"Không tìm thấy tài khoản với Id [{id}].");
            return _mapper.Map<AccountDto>(account);
        }

        public async Task<AccountDto> GetByUsername(string username)
        {
            var accountExisting = await _accountRepository.GetAsync(x => x.Username == username);
            if (accountExisting is not null)
                throw new AlreadyExistsException("Tên đăng nhập đã tồn tại.");
            return _mapper.Map<AccountDto>(accountExisting);
        }

        public async Task<AccountDto> Update(AccountDto dto)
        {
            var account = await _accountRepository.GetByIdAsync(dto.Id);
            if (account is null)
                throw new NotFoundException("Không tìm thấy tài khoản, không thể cập nhật.");

            var updatedAccount = _mapper.Map<Account>(dto);
            updatedAccount.Id = dto.Id;

            _accountRepository.Update(updatedAccount);
            return _mapper.Map<AccountDto>(await _accountRepository.GetByIdAsync(dto.Id));
        }
    }
}
