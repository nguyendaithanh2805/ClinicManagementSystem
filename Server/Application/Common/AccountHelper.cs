using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Application.Exceptions;
using Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.JsonWebTokens;

namespace Application.Common
{
    public class AccountHelper : IAccountHelper
    {
        private readonly IHttpContextAccessor _contextAccessor;
        public AccountHelper(IHttpContextAccessor contextAccessor)
        {
            _contextAccessor = contextAccessor;
        }

        public async Task<int> GetAccountId()
        {
            // ..\ClinicManagementSystem\Server\Infrastructure\Authentication\JwtTokenGenerator.cs
            var claim = _contextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
            if (claim is null)
                throw new NotFoundException("Không tìm thấy claim AccountId");
            return await Task.FromResult(int.Parse(claim.Value));
        }

        public async Task<int> GetRoleId()
        {
            var claim = _contextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role);
            if (claim is null)
                throw new NotFoundException("Không tìm thấy claim Role");
            return await Task.FromResult(int.Parse(claim.Value));
        }
    }
}
