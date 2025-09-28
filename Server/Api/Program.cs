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
using Microsoft.AspNetCore.Mvc;
using Domain.Entities;

var builder = WebApplication.CreateBuilder(args);

// https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-9.0
const string MyAllowSpecificOrigins = "MyAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy("MyAllowSpecificOrigins", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


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
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPasswordHasher<AccountDto>, PasswordHasher<AccountDto>>();
builder.Services.AddScoped<IPasswordHasher<PatientWithAccountDto>, PasswordHasher<PatientWithAccountDto>>();
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IAccountHelper, AccountHelper>();
builder.Services.AddScoped<IService<AppointmentDto>, AppointmentService>();
builder.Services.AddScoped<IService<SpecialtyDto>, SpecialtyService>();
builder.Services.AddScoped<IService<RoleDto>, RoleService>();
builder.Services.AddScoped<IService<MedicalServiceDto>, MedicalServiceImpl>();
builder.Services.AddScoped<IAccounService, AccountService>();
builder.Services.AddScoped<IService<StaffDto>, StaffService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();

// Handle when validation returns an invalid format
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var firstError = context.ModelState
            .Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage)
            .FirstOrDefault() ?? "Invalid data";

        var response = new
        {
            message = firstError
        };

        return new BadRequestObjectResult(response);
    };
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseHttpsRedirection();

app.UseCors(MyAllowSpecificOrigins);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
