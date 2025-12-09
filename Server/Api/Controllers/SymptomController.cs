using Api.Responses;
using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/staff/symptoms")]
    [ApiController]
    public class SymptomController : ControllerBase
    {
        private readonly ISymptomService _symptomService;

        public SymptomController(ISymptomService symptomService)
        {
            _symptomService = symptomService;
        }

        [HttpGet("{patientMedicalRecordId:int}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetAllByMedicalRecordAsync([FromRoute] int patientMedicalRecordId)
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<SymptomDto>>(true, "Lấy dữ liệu thành công", await _symptomService.GetAllByMedicalRecordAsync(patientMedicalRecordId)));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> AddAsync(SymptomDto dto)
        {
            try
            {
                return Created(string.Empty,
                    new ApiResponse<SymptomDto>(true, "Thêm triệu chứng thành công",
                    await _symptomService.AddAsync(dto)));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            try
            {
                await _symptomService.Delete(id);
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
