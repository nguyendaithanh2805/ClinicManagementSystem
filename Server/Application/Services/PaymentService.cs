using Application.DTOs;
using Application.Interfaces;
using Application.Utilities;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Application.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly VnPayConfig _config;
        private readonly IRepository<Invoice> _invoiceRepository;
        private readonly IRepository<PaymentTransaction> _paymentTransactionRepository;
        private readonly IUnitOfWork _unitOfWork;

        // Sử dụng IOptions để đọc cấu hình từ appsettings.json
        public PaymentService(IOptions<VnPayConfig> config, IRepository<Invoice> invoiceRepository, IRepository<PaymentTransaction> paymentTransactionRepository, IUnitOfWork unitOfWork)
        {
            _config = config.Value;
            _invoiceRepository = invoiceRepository;
            _paymentTransactionRepository = paymentTransactionRepository;
            _unitOfWork = unitOfWork;
        }

        public string CreateVnPayPaymentUrl(int invoiceId, decimal amount, string ipAddress)
        {
            const string vnTimeZoneId = "SE Asia Standard Time";

            DateTime vnTimeNow;
            try
            {
                var vnTimeZone = TimeZoneInfo.FindSystemTimeZoneById(vnTimeZoneId);
                vnTimeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vnTimeZone);
            }
            catch (TimeZoneNotFoundException)
            {
                vnTimeNow = DateTime.UtcNow.AddHours(7);
            }

            var vnpAmount = (long)(amount * 100);
            var txnRef = $"{invoiceId}_{DateTime.Now.Ticks}";
            var vnpay = new VnPayLibrary();

            vnpay.AddRequestData("vnp_Version", "2.1.0");
            vnpay.AddRequestData("vnp_Command", "pay");
            vnpay.AddRequestData("vnp_TmnCode", _config.TmnCode);
            vnpay.AddRequestData("vnp_Amount", vnpAmount.ToString());
            vnpay.AddRequestData("vnp_CreateDate", vnTimeNow.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", "VND");
            vnpay.AddRequestData("vnp_IpAddr", ipAddress);
            vnpay.AddRequestData("vnp_Locale", "vn");
            vnpay.AddRequestData("vnp_OrderInfo", $"Hóa đơn thanh toán [{invoiceId}]");
            vnpay.AddRequestData("vnp_OrderType", "other");
            vnpay.AddRequestData("vnp_ReturnUrl", _config.ReturnUrl);
            vnpay.AddRequestData("vnp_TxnRef", txnRef);
            vnpay.AddRequestData("vnp_ExpireDate", vnTimeNow.AddMinutes(15).ToString("yyyyMMddHHmmss"));

            string paymentUrl = vnpay.CreateRequestUrl(_config.VnpUrl, _config.HashSecret);
            return paymentUrl;
        }

        public async Task<VnPayIpnResponse> ProcessVnPayIpn(IQueryCollection collections)
        {
            var vnpay = new VnPayLibrary();

            // 1. Đổ dữ liệu từ VNPAY trả về vào thư viện
            foreach (var (key, value) in collections)
            {
                if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                {
                    vnpay.AddResponseData(key, value.ToString());
                }
            }

            // 2. Lấy các thông tin quan trọng
            string vnp_SecureHash = collections.FirstOrDefault(k => k.Key == "vnp_SecureHash").Value;
            string vnp_ResponseCode = vnpay.GetResponseData("vnp_ResponseCode");
            string vnp_TxnRef = vnpay.GetResponseData("vnp_TxnRef");
            long vnp_Amount = Convert.ToInt64(vnpay.GetResponseData("vnp_Amount")); // Đã nhân 100

            // 3. Kiểm tra Chữ ký (Checksum)
            bool checkSignature = vnpay.ValidateSignature(vnp_SecureHash, _config.HashSecret);
            if (!checkSignature)
            {
                return new VnPayIpnResponse { RspCode = "97", Message = "Invalid signature" };
            }

            // 4. Lấy InvoiceId từ TxnRef (Format: "{invoiceId}_{ticks}")
            var parts = vnp_TxnRef.Split('_');
            if (parts.Length < 1 || !int.TryParse(parts[0], out int invoiceId))
            {
                return new VnPayIpnResponse { RspCode = "01", Message = "Invoice not found" };
            }

            // 5. Tìm invoice trong DB
            var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
            if (invoice == null) { return new VnPayIpnResponse { RspCode = "01", Message = "Invoice not found" }; }

            // 6. Kiểm tra số tiền (Amount)
            long amountInDb = (long)(invoice.TotalAmount * 100);
            if (amountInDb != vnp_Amount) { return new VnPayIpnResponse { RspCode = "04", Message = "Invalid amount" }; }

            // 7. Kiểm tra trạng thái (Idempotency)
            // Nếu invoice đã thanh toán rồi thì trả về mã 02
            if (invoice.Status == true) { return new VnPayIpnResponse { RspCode = "02", Message = "Invoice already confirmed" }; }

            // 8. Xử lý kết quả
            try
            {
                await _unitOfWork.BeginTransactionAsync();

                if (vnp_ResponseCode == "00")
                {
                    // --- THÀNH CÔNG ---
                    invoice.Status = true;
                    invoice.PaymentDate = DateTime.UtcNow;
                    _invoiceRepository.Update(invoice);

                    await _paymentTransactionRepository.AddAsync(new PaymentTransaction
                    {
                        InvoiceId = invoiceId,
                        TransactionNo = vnpay.GetResponseData("vnp_TransactionNo"),
                        Amount = invoice.TotalAmount,
                        Status = "Success",
                        CreatedAt = DateTime.UtcNow
                    });
                }
                else
                {
                    // --- THẤT BẠI ---
                    // Chỉ cần lưu log giao dịch thất bại
                    await _paymentTransactionRepository.AddAsync(new PaymentTransaction
                    {
                        InvoiceId = invoiceId,
                        TransactionNo = vnpay.GetResponseData("vnp_TransactionNo"),
                        Amount = invoice.TotalAmount,
                        Status = $"Failed ({vnp_ResponseCode})",
                        CreatedAt = DateTime.UtcNow
                    });
                }

                await _unitOfWork.CommitAsync();

                return new VnPayIpnResponse { RspCode = "00", Message = "Confirm Success" };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackAsync();
                // Trả về RspCode 99 để VNPAY biết Merchant chưa xử lý xong và bật cơ chế Retry
                return new VnPayIpnResponse { RspCode = "99", Message = "Transaction failed" };
            }
        }

        public async Task<PaymentReturnDto> ProcessVnPayReturnUrl(IQueryCollection collections)
        {
            var vnpay = new VnPayLibrary();

            // 1. Đổ dữ liệu từ VNPAY trả về vào thư viện
            foreach (var (key, value) in collections)
            {
                if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                {
                    vnpay.AddResponseData(key, value.ToString());
                }
            }

            // 2. Lấy các thông tin quan trọng
            string vnp_SecureHash = collections.FirstOrDefault(k => k.Key == "vnp_SecureHash").Value;
            string vnp_ResponseCode = vnpay.GetResponseData("vnp_ResponseCode");
            string vnp_TxnRef = vnpay.GetResponseData("vnp_TxnRef");
            // VNPAY Amount là đơn vị VNĐ, cần chia cho 100 để có giá trị thực (nếu không phải là VND)
            // Tuy nhiên, thường VNPAY trả về Amount đã nhân 100, nên ta sẽ chia lại cho 100 khi hiển thị.
            long vnp_Amount = Convert.ToInt64(vnpay.GetResponseData("vnp_Amount"));

            // Lấy InvoiceId từ TxnRef (Giả định TxnRef có dạng: InvoiceId_Timestamp)
            var parts = vnp_TxnRef.Split('_');
            int invoiceId = int.Parse(parts.Length > 0 ? parts[0] : vnp_TxnRef);

            // 3. Kiểm tra Chữ ký (Checksum)
            bool checkSignature = vnpay.ValidateSignature(vnp_SecureHash, _config.HashSecret);

            if (!checkSignature)
            {
                // Trả về HTTP 400 hoặc thông báo lỗi bảo mật ngay lập tức
                throw new Exception("Lỗi bảo mật: Sai chữ ký điện tử (SecureHash)");
            }

            // 4. Xử lý kết quả giao dịch dựa trên vnp_ResponseCode
            if (vnp_ResponseCode == "00")
            {
                // Giao dịch thành công (Success)
                return new PaymentReturnDto
                {
                    IsSuccess = true,
                    Message = "Thanh toán thành công. Hóa đơn đang được xử lý.",
                    InvoiceId = invoiceId,
                    VnpayTransactionId = vnpay.GetResponseData("vnp_TransactionNo"),
                    Amount = vnp_Amount / 100 // Chia cho 100 để hiển thị
                };
            }
            else
            {
                // Giao dịch thất bại hoặc trạng thái khác

                string message = GetVnPayErrorMessage(vnp_ResponseCode);
                var errorData = new PaymentReturnDto
                {
                    IsSuccess = false,
                    Message = message,
                    InvoiceId = invoiceId,
                    VnpayTransactionId = vnpay.GetResponseData("vnp_TransactionNo"),
                    Amount = vnp_Amount / 100
                };

                return errorData;
            }
        }

        // Hàm bổ trợ để ánh xạ mã lỗi sang thông điệp
        private string GetVnPayErrorMessage(string responseCode)
        {
            return responseCode switch
            {
                "07" => "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
                "09" => "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
                "10" => "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.",
                "11" => "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.",
                "12" => "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
                "13" => "Giao dịch không thành công do: Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
                "24" => "Giao dịch đã bị Quý khách hủy.",
                "51" => "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
                "65" => "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
                "75" => "Ngân hàng thanh toán đang bảo trì.",
                "79" => "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.",
                _ => $"Giao dịch thất bại. Mã lỗi VNPAY: {responseCode}. Vui lòng liên hệ hỗ trợ."
            };
        }
    }
}
