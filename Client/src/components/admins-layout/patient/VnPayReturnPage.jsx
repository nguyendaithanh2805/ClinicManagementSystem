import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Home, FileText } from 'lucide-react';
import api from "../../admins-layout/contexts/Api";

const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

const VnPayReturnPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentResult, setPaymentResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleReturn = async () => {
            setIsLoading(true);
            try {
                const queryString = location.search;

                const response = await api.get(`/vnpay/return-url${queryString}`);

                setPaymentResult(response.data); 

            } catch (error) {
                const errorData = error.response?.data;
                
                if(errorData && error.response.status === 400) {
                    setPaymentResult({
                        isSuccess: false,
                        message: errorData.message || "Xác thực không thành công.",
                        invoiceId: errorData.invoiceId,
                        vnpayTransactionId: errorData.vnpayTransactionId,
                        amount: errorData.amount
                    });
                } else {
                    const vnpResponseCode = new URLSearchParams(queryString).get('vnp_ResponseCode');

                    let defaultMessage = "Lỗi kết nối hoặc hủy giao dịch. Vui lòng kiểm tra lại.";
                    if (vnpResponseCode === '24') {
                        defaultMessage = "Giao dịch đã bị Quý khách hủy.";
                    }
                    
                    setPaymentResult({
                        isSuccess: false,
                        message: defaultMessage,
                        invoiceId: "N/A"
                    });
                }
            } finally {
                setIsLoading(false);
            }
        };

        handleReturn();
    }, [location.search, navigate]);

    const ResultDisplay = ({ result }) => {
    const isSuccessful = result.isSuccess;
    const Icon = isSuccessful ? CheckCircle : XCircle;
    const colorClass = isSuccessful ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white shadow-xl rounded-xl w-full max-w-md mx-auto">
            <div className={`p-4 rounded-full ${colorClass} mb-6`}>
                <Icon className="w-12 h-12" />
            </div>
            <h1 className={`text-2xl font-bold mb-3 ${isSuccessful ? 'text-green-700' : 'text-red-700'}`}>
                {isSuccessful ? 'Giao Dịch Thành Công' : 'Giao Dịch Thất Bại'}
            </h1>
            <p className="text-gray-600 text-center mb-4">{result.message}</p>
            
            <div className="mt-4 w-full text-left border-t pt-4 space-y-2">
                <p className="text-sm font-medium text-gray-800 flex justify-between">
                    Mã hóa đơn: <span className="font-normal text-gray-600">{result.invoiceId || 'N/A'}</span>
                </p>
                
                {(isSuccessful || result.amount > 0) && (
                    <p className="text-sm font-medium text-gray-800 flex justify-between">
                        Số tiền: <span className="font-normal text-gray-600">{formatCurrency(result.amount)}</span>
                    </p>
                )}
                
                {isSuccessful && result.vnpayTransactionId && (
                    <p className="text-sm font-medium text-gray-800 flex justify-between">
                        Mã giao dịch VNPAY: <span className="font-normal text-gray-600">{result.vnpayTransactionId}</span>
                    </p>
                )}
                
                {isSuccessful && (
                    <p className="text-xs text-yellow-600 pt-2 border-t mt-3 italic">
                        Lưu ý: Trạng thái đơn hàng cuối cùng sẽ được xác nhận bởi hệ thống sau vài phút.
                    </p>
                )}

            </div>

            <Link 
                to="/patient/invoices" 
                className="mt-6 flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
                <Home className="w-4 h-4 mr-2" /> Quay về trang hóa đơn
            </Link>
        </div>
    );
};

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 mr-2 animate-spin text-blue-500" />
                <span className="text-lg text-gray-600">Đang xác thực kết quả thanh toán từ VNPAY...</span>
            </div>
        );
    }

    return (
        // Điều chỉnh Tailwind CSS để đẩy nội dung lên trên:
        // Thay 'items-center justify-center' bằng 'items-start justify-center' và thêm 'pt-16'
        <div className="min-h-screen flex items-start justify-center bg-gray-50 p-4 pt-16"> 
            {paymentResult ? <ResultDisplay result={paymentResult} /> : (
                <div className="p-8 bg-white shadow-xl rounded-xl max-w-md mx-auto text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Không có dữ liệu kết quả thanh toán.</p>
                </div>
            )}
        </div>
    );
};

export default VnPayReturnPage;