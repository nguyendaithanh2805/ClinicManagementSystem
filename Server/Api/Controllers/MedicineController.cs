using Api.Responses;
using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/staff/medicines")]
    [ApiController]
    [Authorize(Roles = "Doctor, Receptionist")]
    public class MedicineController : ControllerBase
    {
        private readonly IService<MedicineDto> _medicineService;

        public MedicineController(IService<MedicineDto> medicineService)
        {
            _medicineService = medicineService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<MedicineDto>>(true, "Lấy dữ liệu thành công", await _medicineService.GetAllAsync()));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }
    }
}
