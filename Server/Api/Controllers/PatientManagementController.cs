using Api.Responses;
using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/patients")]
    [ApiController]
    public class PatientManagementController : ControllerBase
    {
        private readonly IPatientService _patientService;
        private readonly IAppointmentService _appointmentService;
        private readonly IInvoiceService _invoiceService;
        private readonly IMedicalRecordService _medicalRecordService;

        public PatientManagementController(IPatientService patientService, IAppointmentService appointmentService, IInvoiceService invoiceService, IMedicalRecordService medicalRecordService)
        {
            _patientService = patientService;
            _appointmentService = appointmentService;
            _invoiceService = invoiceService;
            _medicalRecordService = medicalRecordService;
        }

        [HttpGet("appointments/me")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetAllAppointmentByPatient()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<AppointmentDto>>(true, "Lấy dữ liệu thành công", await _appointmentService.GetAllAppointmentByPatient()));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpGet("invoices/me")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetAllInvoiceByPatient()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<InvoiceDto>>(true, "Lấy dữ liệu thành công", await _invoiceService.GetAllInvoiceByPatient()));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpGet("medical-records/me")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetAllMedicalRecordByPatient()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<PatientMedicalRecordDto>>(true, "Lấy dữ liệu thành công", await _medicalRecordService.GetAllMedicalRecordByPatient()));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpDelete("appointments/{id:int}")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> DeleteAppointment([FromRoute] int id)
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

        [Authorize(Roles = "Patient")]
        [HttpGet("accounts/me")]
        public async Task<IActionResult> GetAccountByPatient()
        {
            try
            {
                return Ok(new ApiResponse<PatientDto>(true, "Lấy dữ liệu thành công", await _patientService.GetPatientByIdIncludeAccount()));
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

        [Authorize(Roles = "Patient")]
        [HttpPatch("accounts/me/{id:int}")]
        public async Task<IActionResult> UpdatePatientAccount([FromRoute] int id, [FromBody] PatientWithAccountDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id != dto.Id)
                    return BadRequest("Id không khớp");
                await _patientService.UpdatePatientAccount(dto);
                return Ok(new ApiResponse<PatientWithAccountDto>(true, "Cập nhật thành công", null));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [Authorize(Roles = "Patient")]
        [HttpPatch("accounts/change-password/{id:int}")]
        public async Task<IActionResult> UpdatePasswordForPatientAccount([FromRoute] int id, [FromBody] ChangePasswordDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id != dto.AccountId)
                    return BadRequest("Id không khớp");

                await _patientService.UpdatePasswordForPatientAccountAsync(dto);

                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
            catch (InvalidPasswordException ex)
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
