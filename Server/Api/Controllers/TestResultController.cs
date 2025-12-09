using Api.Responses;
using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/staff/labs")]
    [ApiController]
    [Authorize(Roles = "LabTechnician")]
    public class TestResultController : ControllerBase
    {
        private readonly ITestResultService _testResultService;
        private readonly IFileStorageService _fileStorageService;

        public TestResultController(ITestResultService testResultService, IFileStorageService fileStorageService)
        {
            _testResultService = testResultService;
            _fileStorageService = fileStorageService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMedicalRecordWithRequiredTest()
        {
            try
            {
                return Ok(new ApiResponse<IEnumerable<PatientMedicalRecordDto>>(true, "Lấy dữ liệu thành công", await _testResultService.GetAllMedicalRecordWithRequiredTest()));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromForm] TestResultDto dto, [FromForm] IFormFile? file)
        {
            try
            {
                if (file != null && file.Length > 0)
                {
                    using var stream = file.OpenReadStream();
                    var savedPath = await _fileStorageService.SaveFileAsync(stream, file.FileName);

                    dto.Image = savedPath; // Gán path trả về từ service, không phải tên gốc
                }
                else
                {
                    dto.Image = null; // Nếu không upload thì để null
                }

                return Created(string.Empty,
                    new ApiResponse<TestResultDto>(true, "Thêm kết quả xét nghiệm thành công", await _testResultService.AddAsync(dto)));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message, null));
            }
        }

        [HttpPatch("{id:int}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromForm] TestResultDto dto, [FromForm] IFormFile? file)
        {
            try
            {
                if (file != null && file.Length > 0)
                {
                    using var stream = file.OpenReadStream();
                    var savedPath = await _fileStorageService.SaveFileAsync(stream, file.FileName);

                    dto.Image = savedPath; // Cập nhật ảnh mới
                }

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id != dto.Id)
                    return BadRequest("Id không khớp");

                return Ok(new ApiResponse<TestResultDto>(true, "Cập nhật xét nghiệm thành công",
                    await _testResultService.Update(dto)));
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
                await _testResultService.Delete(id);
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
