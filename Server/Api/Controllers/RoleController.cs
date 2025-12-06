using Api.Responses;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/roles")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly IService<RoleDto> _service;

        public RoleController(IService<RoleDto> service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<RoleDto>>(true, "Lấy dữ liệu thành công", await _service.GetAllAsync()));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }
    }
}
