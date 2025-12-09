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
        public async Task<IActionResult> GetAllForLabTechnicianAsync()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<PatientMedicalRecordDto>>(true, "Lấy dữ liệu thành công", await _medicalRecordService.GetAllForLabTechnicianAsync()));
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

                return Ok(new ApiResponse<PatientMedicalRecordDto>(true, "Cập nhật Hồ sơ bệnh án thành công",
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

        [HttpPut("confirm-completed/{medicalRecordId:int}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> ConfirmCompleted([FromRoute] int medicalRecordId)
        {
            try
            {
                await _medicalRecordService.ConfirmCompleted(medicalRecordId);
                return Ok(new ApiResponse<PatientMedicalRecordDto>(true, "Xác nhận hoàn thành khám thành công", null));
            }
            catch (NotFoundException ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
            catch (ErrorException ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpPut("confirm-revisit/{medicalRecordId:int}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> ConfirmRevist([FromRoute] int medicalRecordId, [FromBody] ConfirmIsRevisitAppointment revisitAppointment)
        {
            try
            {
                await _medicalRecordService.ConfirmIsRevisit(medicalRecordId, revisitAppointment);
                return Ok(new ApiResponse<PatientMedicalRecordDto>(true, "Xác nhận tái khám thành công", null));
            }
            catch (NotFoundException ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
            catch (ErrorException ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpPut("confirm-inprogress/{medicalRecordId:int}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> ConfirmInProgress([FromRoute] int medicalRecordId)
        {
            try
            {
                await _medicalRecordService.ConfirmInProgress(medicalRecordId);
                return Ok(new ApiResponse<PatientMedicalRecordDto>(true, "Xác nhận đang khám", null));
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

        [HttpPut("confirm-completed-revisit/{medicalRecordId:int}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> ConfirmCompletedRevisit([FromRoute] int medicalRecordId)
        {
            try
            {
                await _medicalRecordService.ConfirmCompletedRevisit(medicalRecordId);
                return Ok(new ApiResponse<PatientMedicalRecordDto>(true, "Xác nhận hoàn thành tái khám", null));
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
