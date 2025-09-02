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
            // 1. Đăng ký trực tiếp JwtSettings singleton
            // dotnet add package Microsoft.Extensions.Options.ConfigurationExtensions
            // Đăng ký trực tiếp JwtSettings singleton
            services.AddSingleton(configuration.GetSection("Jwt").Get<JwtSettings>());

            // 2. Đăng ký service tạo JWT
            services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

            return services;
        }
    }
}
