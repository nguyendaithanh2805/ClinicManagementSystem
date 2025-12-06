using Api.Responses;
using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers
{
    [Route("api/staff/medicines")]
    [ApiController]
    [Authorize(Roles = "Doctor, Receptionist, Admin")]
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

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] MedicineDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                return Ok(
                    new ApiResponse<MedicineDto>(true, "Thêm thuốc thành công", await _medicineService.AddAsync(dto)));
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
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] MedicineDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id != dto.Id)
                    return BadRequest("Id không khớp");

                return Ok(new ApiResponse<MedicineDto>(true, "Cập nhật thuốc thành công",
                    await _medicineService.Update(dto)));
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
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            try
            {
                await _medicineService.Delete(id);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
            catch (DbUpdateException ex)
            {
                // Kiểm tra nếu lỗi do ràng buộc khóa ngoại PrescriptionDetail
                if (ex.InnerException is SqlException sqlEx && sqlEx.Message.Contains("FK_PrescriptionDetail_Medicine"))
                {
                    return BadRequest(new ApiResponse<string>(false, "Thuốc đang được sử dụng kê đơn cho bệnh nhân", null));
                }

                // Trường hợp lỗi khác
                return BadRequest(new ApiResponse<string>(false, "Không thể xóa thuốc do lỗi cơ sở dữ liệu", null));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }
    }
}
