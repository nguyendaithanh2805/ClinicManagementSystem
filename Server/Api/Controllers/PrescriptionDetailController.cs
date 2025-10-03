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
    [Route("api/staff/prescription-details")]
    [ApiController]
    public class PrescriptionDetailController : ControllerBase
    {
        private readonly IPrescriptionDetailService _prescriptionDetailService;

        public PrescriptionDetailController(IPrescriptionDetailService prescriptionDetailService)
        {
            _prescriptionDetailService = prescriptionDetailService;
        }

        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> AddAsync(PrescriptionDetailDto dto)
        {
            try
            {
                return Created(string.Empty,
                    new ApiResponse<PrescriptionDetailDto>(true, "Thêm đơn thuốc thành công",
                    await _prescriptionDetailService.AddAsync(dto)));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpPut("{prescriptionId:int}/{medicineId:int}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> Update([FromRoute] int prescriptionId,
                                                [FromRoute] int medicineId, 
                                                [FromBody] PrescriptionDetailDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (prescriptionId != dto.PrescriptionId || medicineId != dto.MedicineId)
                    return BadRequest("Id không khớp");

                return Ok(new ApiResponse<PrescriptionDetailDto>(true, "Cập nhật đơn thuốc thành công",
                    await _prescriptionDetailService.Update(dto)));
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

        [HttpDelete("{prescriptionId:int}/{medicineId:int}")]
        public async Task<IActionResult> Delete([FromRoute] int prescriptionId,
                                                [FromRoute] int medicineId)
        {
            try
            {
                await _prescriptionDetailService.Delete(prescriptionId, medicineId );
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
