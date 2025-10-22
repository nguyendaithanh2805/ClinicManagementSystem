import React from 'react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

const PrintableInvoice = ({ invoice, formatCurrency }) => {
  if (!invoice) {
    return <div className="text-center p-2 text-sm">Không có dữ liệu hóa đơn để in.</div>;
  }

  const getStatusText = (status) => {
    switch (status) {
      case true: return 'Đã thanh toán';
      case false: return 'Chờ thanh toán';
      default: return 'Không xác định';
    }
  };

  // Lấy chi tiết đơn thuốc một cách an toàn
  const prescriptionDetails = invoice.patientMedicalRecord?.prescriptions &&
    invoice.patientMedicalRecord.prescriptions.length > 0
    ? invoice.patientMedicalRecord.prescriptions[0].prescriptionDetails
    : [];

  return (
    <div className="p-6 text-xs" style={{ backgroundColor: '#ffffff', color: '#1f2937' }}>

      {/* Header - Thông tin bệnh viện và Hóa đơn */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
        <div className="text-left">
          <p className="text-lg font-bold text-gray-800 mb-0.5">BỆNH VIỆN ĐA KHOA</p>
          <p className="text-xs text-gray-600">123 Đường ABC, Quận XYZ, TP.HCM</p>
          <p className="text-xs text-gray-600">Điện thoại: (028) 1234 5678</p>
          <p className="text-xs text-gray-600">Email: info@benhvienyte.com</p>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-extrabold text-blue-800 mb-1">HÓA ĐƠN</h1>
          <p className="text-sm text-gray-700">Mã hóa đơn: <span className="font-semibold text-gray-800">{invoice.id}</span></p>
          {invoice.paymentDate && (
            <p className="text-sm text-gray-700">Ngày lập: <span className="font-semibold text-gray-800">{format(parseISO(invoice.paymentDate), 'dd/MM/yyyy', { locale: vi })}</span></p>
          )}
        </div>
      </div>

      {/* Thông Tin Khách Hàng */}
      <div className="mb-6">
        <h2 className="text-base font-bold text-gray-800 mb-2 border-b pb-1">THÔNG TIN KHÁCH HÀNG</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-gray-700 text-xs">
          <div>
            {/* SỬA Ở ĐÂY */}
            <p><strong className="text-gray-900">Tên bệnh nhân:</strong> {invoice.patientMedicalRecord?.patient?.fullName || 'N/A'}</p>
            <p><strong className="text-gray-900">Email:</strong> {invoice.patientMedicalRecord?.patient?.account?.email || 'N/A'}</p>
          </div>
          <div>
            {/* SỬA Ở ĐÂY */}
            <p><strong className="text-gray-900">Số điện thoại:</strong> {invoice.patientMedicalRecord?.patient?.account?.phoneNumber || 'N/A'}</p>
            <p><strong className="text-gray-900">Địa chỉ:</strong> {invoice.patientMedicalRecord?.patient?.address || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Chi Tiết Dịch Vụ */}
      <div className="mb-6">
        <h2 className="text-base font-bold text-gray-800 mb-2 border-b pb-1">CHI TIẾT DỊCH VỤ</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-sm">
            <thead>
              <tr className="bg-blue-50 text-left text-blue-800 uppercase text-xs leading-normal">
                <th className="py-2 px-4 border-b border-gray-300">STT</th>
                <th className="py-2 px-4 border-b border-gray-300">Dịch Vụ</th>
                <th className="py-2 px-4 border-b border-gray-300 text-right">Giá</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-xs">
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-2 px-4">1</td>
                {/* SỬA Ở ĐÂY */}
                <td className="py-2 px-4">{invoice.patientMedicalRecord?.appointment?.medicalService?.name || 'Dịch vụ không xác định'}</td>
                <td className="py-2 px-4 text-right">{formatCurrency(invoice.patientMedicalRecord?.appointment?.medicalService?.cost || 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescription Details - SỬA Ở ĐÂY */}
      {prescriptionDetails && prescriptionDetails.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-2 border-b pb-1">CHI TIẾT ĐƠN THUỐC</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-sm">
              <thead>
                <tr className="bg-orange-50 text-left text-orange-800 uppercase text-xs leading-normal">
                  <th className="py-2 px-4 border-b border-gray-300">STT</th>
                  <th className="py-2 px-4 border-b border-gray-300">Tên thuốc</th>
                  <th className="py-2 px-4 border-b border-gray-300">Liều dùng</th>
                  <th className="py-2 px-4 border-b border-gray-300">Tần suất</th>
                  <th className="py-2 px-4 border-b border-gray-300">Đơn giá</th>
                  <th className="py-2 px-4 border-b border-gray-300 text-right">Số lượng</th>
                  <th className="py-2 px-4 border-b border-gray-300 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-xs">
                {/* SỬA Ở ĐÂY */}
                {prescriptionDetails.map((detail, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">{detail.medicine?.name || 'Thuốc không xác định'}</td>
                    <td className="py-2 px-4">{detail.dosage}</td>
                    <td className="py-2 px-4">{detail.frequency}</td>
                    <td className="py-2 px-4 text-right">{formatCurrency(detail.medicine?.price || 0)}</td>
                    <td className="py-2 px-4 text-right">{detail.quantity}</td>
                    <td className="py-2 px-4 text-right">{formatCurrency(detail.amount || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tổng cộng và Trạng thái */}
      <div className="flex justify-end mb-6">
        <div className="w-full sm:w-1/2 md:w-2/3 space-y-2 text-gray-800">
          <div className="flex justify-between font-semibold text-base">
            <span>Tổng cộng:</span>
            <span className="text-blue-700">{formatCurrency(invoice.totalAmount || 0)}</span>
          </div>
          <div className="flex justify-between font-semibold text-sm text-green-700">
            <span>Trạng thái:</span>
            <span>{getStatusText(invoice.status)}</span>

          </div>
          {invoice.paymentDate && (
            <div className="flex justify-between text-xs">
              <span>Ngày thanh toán:</span>
              <span>{format(parseISO(invoice.paymentDate), 'HH:mm dd/MM/yyyy', { locale: vi })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-600 mt-8 pt-4 border-t border-gray-200">
        <p className="mb-1 text-xs">Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
      </div>
    </div>
  );
};

export default PrintableInvoice;