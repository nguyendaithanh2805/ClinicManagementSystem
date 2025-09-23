using Api.Responses;
using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/staff/patients")]
    [ApiController]
    public class PatientController : ControllerBase
    {
        private readonly IPatientService _patientService;

        public PatientController(IPatientService patientService)
        {
            _patientService = patientService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin, Receptionist")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<PatientWithAccountDto>>(true, "Lấy dữ liệu thành công", await _patientService.GetAllWithAccountAsync()));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [Authorize(Roles = "Admin, Receptionist, Patient")]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                return Ok(new ApiResponse<PatientDto>(true, "Lấy dữ liệu thành công", await _patientService.GetByIdAsync(id)));
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

        [HttpPatch("{id:int}")]
        [Authorize(Roles = "Admin, Receptionist")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] PatientDto patientDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id != patientDto.Id)
                    return BadRequest("Id không khớp");

                return Ok(new ApiResponse<PatientDto>(true, "Cập nhật bệnh nhân thành công",
                    await _patientService.Update(patientDto)));
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
        [Authorize(Roles = "Admin, Receptionist")]
        public async Task<IActionResult> Add([FromBody] PatientWithAccountDto dto)
        {
            try
            {
                return Created(string.Empty,
                    new ApiResponse<PatientWithAccountDto>(true, "Thêm bệnh nhân thành công", await _patientService.AddPatientWithAccountAsync(dto)));
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

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin, Receptionist")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            try
            {
                await _patientService.Delete(id);
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
