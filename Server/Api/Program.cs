using Application.Common.Settings;
using System.Text;
using Application.Interfaces;
using Application.Mappings;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Application.Services;
using Infrastructure.Authentication;
using Microsoft.AspNetCore.Identity;
using Application.DTOs;
using Application.Common;
using Microsoft.AspNetCore.Mvc;
using Domain.Entities;
using Api.ChatHub;

var builder = WebApplication.CreateBuilder(args);

// https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-9.0
const string MyAllowSpecificOrigins = "MyAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy("MyAllowSpecificOrigins", policy =>
    {
        policy.WithOrigins(
                "http://localhost",
                "https://localhost"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


builder.Services.AddDbContext<ClinicContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DbConnection"),
        sql => sql.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null
        )
    )
);

// Add Infrastureture
builder.Services.AddInfrastructure(builder.Configuration);

// Load Jwt settings

var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Cấu hình xác thực JWT cho API và SignalR
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

        // Cho phép SignalR đọc JWT từ query string (vì WebSocket không có header)
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];

                // Nếu request là tới ChatHub và có token trong query
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/api/chatHub"))
                {
                    context.Token = accessToken; // Gán token vào pipeline
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// Add services to the container.

builder.Services.AddDbContext<ClinicContext>(options => 
    options.UseSqlServer(builder.Configuration.GetConnectionString("DbConnection")));

builder.Services.AddControllers();
builder.Services.AddSignalR();

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
builder.Services.AddScoped<IPasswordHasher<Account>, PasswordHasher<Account>>();
builder.Services.AddScoped<IPasswordHasher<PatientWithAccountDto>, PasswordHasher<PatientWithAccountDto>>();
builder.Services.AddScoped<IPasswordHasher<AccountStaffDto>, PasswordHasher<AccountStaffDto>>();
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
builder.Services.AddScoped<IMedicalRecordService, MedicalRecordService>();
builder.Services.AddScoped<IPrescriptionDetailService, PrescriptionDetailService>();
builder.Services.AddScoped<IService<PrescriptionDto>, PrescriptionService>();
builder.Services.AddScoped<IService<MedicineDto>, MedicineService>();
builder.Services.AddScoped<ISymptomService, SymptomService>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<ITestResultService, TestResultService>();
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddHostedService<ChatCleanupService>();
builder.Services.AddSingleton<IConnectionManagementService, ConnectionManagementService>();
builder.Services.AddScoped<INotificationService, SignalRNotificationService>();
builder.Services.AddScoped<IService<NotificationDto>, NotificationService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

builder.Services.Configure<VnPayConfig>(
    builder.Configuration.GetSection("VnPayConfig"));

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

//app.UseHttpsRedirection();
app.UseRouting();

app.UseCors(MyAllowSpecificOrigins);

app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<ChatHub>("/api/chatHub");
app.Run();
