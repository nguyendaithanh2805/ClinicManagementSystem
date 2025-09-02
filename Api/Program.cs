using System.Reflection.Metadata;
using Application.Common.Settings;
using System.Text;
using Application.Interfaces;
using Application.Mappings;
using AutoMapper;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Application.Services;
using Infrastructure.Authentication;
using System.Reflection;
using Microsoft.AspNetCore.Identity;
using Application.DTOs;
using Microsoft.Extensions.Options;
using Application.Common;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ClinicContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DbConnection")));

// Add Infrastureture
builder.Services.AddInfrastructure(builder.Configuration);

// Load Jwt settings

var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings!.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key))
        };
    });

builder.Services.AddAuthorization();

// Add services to the container.

builder.Services.AddDbContext<ClinicContext>(options => 
    options.UseSqlServer(builder.Configuration.GetConnectionString("DbConnection")));

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Register AutoMapper
builder.Services.AddAutoMapper(cfg => { }, typeof(MapperProfile).Assembly);

// Unit Of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Repository
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Service
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPasswordHasher<AccountDto>, PasswordHasher<AccountDto>>();
builder.Services.AddScoped<IService<PatientDto>, PatientService>();
builder.Services.AddScoped<IAccountHelper, AccountHelper>();
builder.Services.AddScoped<IService<AppointmentDto>, AppointmentService>();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
