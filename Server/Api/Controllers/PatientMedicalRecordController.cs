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
    [Route("api/staff/medical-records")]
    [ApiController]
    public class PatientMedicalRecordController : ControllerBase
    {
        private readonly IMedicalRecordService _medicalRecordService;

        public PatientMedicalRecordController(IMedicalRecordService medicalRecordService)
        {
            _medicalRecordService = medicalRecordService;
        }

        [HttpGet]
        [Authorize(Roles = "Doctor, LabTechnician")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<PatientMedicalRecordDto>>(true, "Lấy dữ liệu thành công", await _medicalRecordService.GetAllAsync()));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpGet("me")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetAllByDoctor()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<PatientMedicalRecordDto>>(true, "Lấy dữ liệu thành công", await _medicalRecordService.GetAllByDoctorAsync()));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            try
            {
                return Ok(new ApiResponse<PatientMedicalRecordDto>(true, "Lấy dữ liệu thành công", await _medicalRecordService.GetByIdAsync(id)));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }


        [HttpPatch("{id:int}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] PatientMedicalRecordDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id != dto.Id)
                    return BadRequest("Id không khớp");

                return Ok(new ApiResponse<PatientMedicalRecordDto>(true, "Cập nhật Hồ sơ Bệnh án thành công",
                    await _medicalRecordService.Update(dto)));
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

        //[HttpPost]
        //[Authorize(Roles = "Doctor")]
        //public async Task<IActionResult> Add([FromBody] PatientMedicalRecordDto dto)
        //{
        //    try
        //    {
        //        return Created(string.Empty,
        //            new ApiResponse<PatientMedicalRecordDto>(true, "Thêm hồ sơ Bệnh án thành công", await _medicalRecordService.AddAsync(dto)));
        //    }
        //    catch (AlreadyExistsException ex)
        //    {
        //        return BadRequest(new ApiResponse<string>(false, ex.Message, null));
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(new ApiResponse<string>(false, ex.Message, null));
        //    }
        //}
    }
}
