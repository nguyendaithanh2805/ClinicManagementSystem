using Api.Responses;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/accounts")]
    [ApiController]
    [Authorize(Roles = "Patient, Receptionist")]
    public class AccountForChatController : ControllerBase
    {
        private readonly IPatientService _patientService;
        private readonly IStaffService _staffService;

        public AccountForChatController(IPatientService patientService, IStaffService staffService)
        {
            _patientService = patientService;
            _staffService = staffService;
        }

        [HttpGet("patients")]
        public async Task<IActionResult> GetAllPatient()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<PatientDto>>(true, "Lấy dữ liệu thành công", await _patientService.GetAllAsync()));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpGet("receptionists")]
        public async Task<IActionResult> GetAllStaff()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<StaffDto>>(true, "Lấy dữ liệu thành công", await _staffService.GetAllReceptionistAsync()));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }
    }
}
