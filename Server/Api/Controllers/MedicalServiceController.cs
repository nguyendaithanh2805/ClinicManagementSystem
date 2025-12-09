using Api.Responses;
using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers
{
    [Route("api/medical-services")]
    [ApiController]
    public class MedicalServiceController : ControllerBase
    {
        private readonly IService<MedicalServiceDto> _medicalService;

        public MedicalServiceController(IService<MedicalServiceDto> medicalService)
        {
            _medicalService = medicalService;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<MedicalServiceDto>>(true, "Lấy dữ liệu thành công", await _medicalService.GetAllAsync()));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [AllowAnonymous]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            try
            {
                return Ok(new ApiResponse<MedicalServiceDto>(true, "Lấy dữ liệu thành công", await _medicalService.GetByIdAsync(id)));
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
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Add([FromBody] MedicalServiceDto MedicalServiceDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                return CreatedAtAction(nameof(GetById),
                    new { Id = MedicalServiceDto.Id },
                    new ApiResponse<MedicalServiceDto>(true, "Thêm dịch vụ y tế thành công", await _medicalService.AddAsync(MedicalServiceDto)));
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

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] MedicalServiceDto MedicalServiceDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id != MedicalServiceDto.Id)
                    return BadRequest("Id không khớp");

                return Ok(new ApiResponse<MedicalServiceDto>(true, "Cập nhật dịch vụ y tế thành công",
                    await _medicalService.Update(MedicalServiceDto)));
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
                await _medicalService.Delete(id);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
            catch (DbUpdateException ex)
            {
                // Kiểm tra nếu lỗi do ràng buộc khóa ngoại PrescriptionDetail
                if (ex.InnerException is SqlException sqlEx && sqlEx.Message.Contains("FK_Appointment_MedicalService"))
                {
                    return BadRequest(new ApiResponse<string>(false, "Dịch vụ này đang có bệnh nhân khám", null));
                }

                // Trường hợp lỗi khác
                return BadRequest(new ApiResponse<string>(false, "Không thể xóa do lỗi cơ sở dữ liệu", null));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }
    }
}
