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
        private readonly IService<PrescriptionDto> _prescriptionService;

        public PrescriptionDetailController(IPrescriptionDetailService prescriptionDetailService, IService<PrescriptionDto> prescriptionService)
        {
            _prescriptionDetailService = prescriptionDetailService;
            _prescriptionService = prescriptionService;
        }

        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> AddAsync(List<PrescriptionDetailDto> dtos)
        {
            try
            {
                foreach (var dto in dtos)
                    await _prescriptionDetailService.AddAsync(dto);
                return Created(string.Empty,
                    new ApiResponse<string>(true, "Thêm đơn thuốc thành công", null));
            }
            catch(NotFoundException ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
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

                return Ok(new ApiResponse<PrescriptionDetailDto>(true, "Cập nhật đơn thuốc thành công",
                    await _prescriptionDetailService.Update(dto, medicineId)));
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
                await _prescriptionDetailService.Delete(prescriptionId, medicineId);
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

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeletePrescription([FromRoute] int id)
        {
            try
            {
                await _prescriptionService.Delete(id);
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
