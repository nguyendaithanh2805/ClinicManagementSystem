using System.Numerics;
using Api.Responses;
using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/specialties")]
    [ApiController]
    public class SpecialtyController : ControllerBase
    {
        private readonly IService<SpecialtyDto> _specialtyService;

        public SpecialtyController(IService<SpecialtyDto> specialtyService)
        {
            _specialtyService = specialtyService;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<SpecialtyDto>>(true, "Lấy dữ liệu thành công", await _specialtyService.GetAllAsync()));
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
                return Ok(new ApiResponse<SpecialtyDto>(true, "Lấy dữ liệu thành công", await _specialtyService.GetByIdAsync(id)));
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
        [Authorize(Roles = "Admin, Receptionist")]
        public async Task<IActionResult> Add([FromBody] SpecialtyDto specialtyDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                return CreatedAtAction(nameof(GetById), 
                    new { Id = specialtyDto.Id}, 
                    new ApiResponse<SpecialtyDto>(true, "Thêm chuyên khoa thành công", await _specialtyService.AddAsync(specialtyDto)));
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
        [Authorize(Roles = "Admin, Receptionist")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] SpecialtyDto specialtyDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id != specialtyDto.Id)
                    return BadRequest("Id không khớp");

                return Ok(new ApiResponse<SpecialtyDto>(true, "Cập nhật chuyên khoa thành công", 
                    await _specialtyService.Update(specialtyDto)));
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
        [Authorize(Roles = "Admin, Receptionist")]
        public IActionResult Delete([FromRoute] int id)
        {
            try
            {
                _specialtyService.Delete(id);
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
