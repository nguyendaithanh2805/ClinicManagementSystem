using Api.Responses;
using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/appointments")]
    [ApiController]
    [Authorize]
    public class AppointmentController : ControllerBase
    {
        private readonly IService<AppointmentDto> _appointmentService;

        public AppointmentController(IService<AppointmentDto> appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [HttpPost]
        public async Task<IActionResult> AddAsync(AppointmentDto appointmentDto)
        {
            try
            {
                return Created(string.Empty,
                    new ApiResponse<AppointmentDto>(true, "Đặt lịch thành công", 
                    await _appointmentService.AddAsync(appointmentDto)));
            }
            catch (AlreadyExistsException ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }
    }
}
