using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/vnpay")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost("create-payment-url")]
        public IActionResult CreateVnPayUrl([FromBody] CreatePaymentRequest request)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            if (ipAddress == "::1") ipAddress = "127.0.0.1";

            string paymentUrl = _paymentService.CreateVnPayPaymentUrl(request.InvoiceId, request.Amount, ipAddress);

            return Ok(new { PaymentUrl = paymentUrl });
        }

        [HttpGet("ipn")]
        [Produces("application/json")]
        public async Task<IActionResult> PaymentExecute()
        {
            try
            {

                var response = await _paymentService.ProcessVnPayIpn(Request.Query);
                return Ok(response);
            } 
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("return-url")]
        public async Task<IActionResult> ReturnUrl()
        {
            var result = await _paymentService.ProcessVnPayReturnUrl(Request.Query);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }
    }
}