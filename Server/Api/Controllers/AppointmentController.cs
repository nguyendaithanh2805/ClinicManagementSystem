using Api.Responses;
using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/staff/appointments")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [HttpGet]
        [Authorize(Roles = "Receptionist")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<AppointmentDto>>(true, "Lấy dữ liệu thành công", await _appointmentService.GetAllAsync()));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpGet("me")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetByDoctor()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<AppointmentDto>>(true, "Lấy dữ liệu thành công", await _appointmentService.GetByDoctorAsync()));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Receptionist, Doctor")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            try
            {
                return Ok(new ApiResponse<AppointmentDto>(true, "Lấy dữ liệu thành công", await _appointmentService.GetByIdAsync(id)));
            }
            catch (NotFoundException ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }

            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpPost]
        [Authorize(Roles = "Patient")]
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

        [HttpPatch("{id:int}")]
        [Authorize(Roles = "Patient, Receptionist, Doctor")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] AppointmentDto appointmentDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id != appointmentDto.Id)
                    return BadRequest("Id không khớp");

                return Ok(new ApiResponse<AppointmentDto>(true, "Cập nhật lịch hẹn thành công",
                    await _appointmentService.Update(appointmentDto)));
            }
            catch (NotFoundException ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            try
            {
                await _appointmentService.Delete(id);
                return NoContent();
            }
            catch (NotFoundException ex)
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
