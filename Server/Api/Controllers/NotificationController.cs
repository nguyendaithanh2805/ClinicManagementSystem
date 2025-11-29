using Api.Responses;
using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly IService<NotificationDto> _notificationService;

        public NotificationController(IService<NotificationDto> notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<NotificationDto>>(true, "Lấy dữ liệu thành công", await _notificationService.GetAllAsync()));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] NotificationDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id != dto.Id)
                    return BadRequest("Id không khớp");

                return Ok(new ApiResponse<NotificationDto>(true, "Cập nhật thành công",
                    await _notificationService.Update(dto)));
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
