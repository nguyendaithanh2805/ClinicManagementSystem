using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Common.Settings;
using Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Authentication
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration configuration)
        {
            // 1. Đăng ký JwtSettings vào hệ thống Options Pattern
            // dotnet add package Microsoft.Extensions.Options.ConfigurationExtensions
            services.Configure<JwtSettings>(configuration.GetSection("Jwt"));

            // 2. Đăng ký service tạo JWT
            services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

            return services;
        }
    }
}
