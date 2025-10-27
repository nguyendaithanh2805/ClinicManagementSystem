import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, DollarSign, BriefcaseMedical, Filter, Search, Calendar, CheckCircle, XCircle, User, FileText, ChevronLeft, ChevronRight, X, Printer, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from "react-toastify";
import api from "../../admins-layout/contexts/Api";
import PrintableInvoice from '../../admins-layout/pages/PrintableInvoice';
import { formatDbUtcToVnTime } from '../../../utils/dateFormatter';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

const ITEMS_PER_PAGE = 5;

const InvoicesPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false);

  const pdfContentRef = useRef();

  const Pill = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 32"
      className="w-4 h-4 mr-1"
    >
      <g transform="rotate(45 32 16)">
        {/* Nửa đỏ */}
        <path d="M0,16a16,16 0 0,1 16,-16h16v32H16A16,16 0 0,1 0,16Z" fill="#ef4444" />
        {/* Nửa vàng */}
        <path d="M32,0h16a16,16 0 0,1 0,32H32V0Z" fill="#facc15" />
        {/* Viền */}
        <rect
          x="0"
          y="0"
          width="64"
          height="32"
          rx="16"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
        />
      </g>
    </svg>
  );


  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const fetchInvoices = async () => {
    if (!user) {
      toast.info('Vui lòng đăng nhập để xem hóa đơn của bạn.');
      return;
    }

    try {
      const response = await api.get('/patients/invoices/me');
      if (response.data.status) {
        setInvoices(response.data.data);
      } else {
        toast.error(response.data.message || 'Không thể tải hóa đơn của bạn.');
        console.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Lỗi khi kết nối đến máy chủ khi tải hóa đơn.');
      console.error('Lỗi khi lấy hóa đơn:', error);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case true: return 'Đã thanh toán';
      case false: return 'Chờ thanh toán';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case true:
        return 'bg-green-100 text-green-700 border-green-200';
      case false:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const patientName = invoice.patientMedicalRecord?.patient?.fullName || '';
    // Truy cập mảng appointments[0]
    const medicalService = invoice.patientMedicalRecord?.appointments?.[0]?.medicalService?.name || '';
    const totalAmount = invoice.totalAmount ? invoice.totalAmount.toString() : '';

    const matchesSearch = searchTerm === '' ||
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicalService.toLowerCase().includes(searchTerm.toLowerCase()) ||
      totalAmount.includes(searchTerm);

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'paid' && invoice.status === true) ||
      (filterStatus === 'pending' && invoice.status === false);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleOpenPdfPreview = () => {
    if (selectedInvoice) {
      setShowPdfPreviewModal(true);
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedInvoice || !pdfContentRef.current) return;

    try {
      const input = pdfContentRef.current;
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: true,
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let position = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`HoaDon_${selectedInvoice.id}.pdf`);
      toast.success("Hóa đơn đã được tải về thành công!");
      setShowPdfPreviewModal(false);
    } catch (error) {
      console.error("Lỗi khi tạo PDF:", error);
      toast.error("Không thể tạo PDF. Vui lòng thử lại hoặc kiểm tra console.");
    }
  };

  const InvoiceCard = ({ invoice }) => (
    <div
      key={invoice.id}
      onClick={() => setSelectedInvoice(invoice)}
      className="border border-medical-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          {invoice.paymentDate && (
            <span className="text-xs font-medium text-medical-600">
              {format(parseISO(invoice.paymentDate), 'dd/MM')}
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-medical-900 mb-1">
                {invoice.patientMedicalRecord?.patient?.fullName || 'Bệnh nhân không xác định'}
              </h3>
              <p className="text-sm text-medical-600 mb-1">
                {invoice.patientMedicalRecord?.appointments?.[0]?.medicalService?.name || 'Dịch vụ không xác định'}
              </p>
              <p className="text-sm text-medical-500">
                Mã hóa đơn: {invoice.id}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                {getStatusText(invoice.status)}
              </span>
              <p className="font-bold text-medical-900 text-lg mt-1">
                {formatCurrency(invoice.totalAmount, 'VND')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm text-medical-600">
            {invoice.paymentDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDbUtcToVnTime(invoice.paymentDate)}</span>
              </div>
            )}
            {invoice.patientMedicalRecord?.patient?.fullName && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Bệnh nhân: {invoice.patientMedicalRecord.patient.fullName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-medical-900 mb-2">
              {user?.role === 'patient' ? 'Lịch sử thanh toán của tôi' : 'Quản lý hóa đơn'}
            </h1>
            <p className="text-medical-600">
              {user?.role === 'patient'
                ? 'Xem và quản lý các giao dịch thanh toán của bạn'
                : 'Quản lý tất cả các hóa đơn của bệnh viện'
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medical-400" />
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 border border-medical-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm appearance-none bg-white"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="pending">Chờ thanh toán</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-medical-900">
            Tìm kiếm giao dịch
          </h2>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medical-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2 border border-medical-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm w-full"
              placeholder="Tìm kiếm mã hóa đơn, bệnh nhân, dịch vụ..."
            />
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-medical-900">
            Danh sách hóa đơn
          </h2>
          <div className="flex items-center gap-2 text-sm text-medical-600">
            <CreditCard className="w-4 h-4" />
            <span>{filteredInvoices.length} hóa đơn</span>
          </div>
        </div>

        <div className="space-y-4">
          {paginatedInvoices.length > 0 ? (
            paginatedInvoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-medical-300 mx-auto mb-4" />
              <p className="text-medical-600">
                {searchTerm || filterStatus !== 'all' ? 'Không tìm thấy hóa đơn nào phù hợp' : 'Chưa có hóa đơn thanh toán nào'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-full text-sm font-medium
                  ${currentPage === page ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (() => {
        // --- LOGIC XÁC ĐỊNH ĐƠN THUỐC LIÊN QUAN ---
        // 1. Tìm Appointment liên quan đến Invoice này. 
        //    Cách tìm phụ thuộc vào backend đã sửa thế nào. 
        //    Giả sử cách đáng tin cậy nhất là tìm Appointment có tổng tiền (dịch vụ + thuốc) khớp với Invoice.totalAmount
        //    (HOẶC nếu backend thêm AppointmentId vào Invoice thì dùng nó)
        
        const relevantAppointment = selectedInvoice.patientMedicalRecord?.appointments?.find(app => {
            const serviceCost = app.medicalService?.cost || 0;
            // Tính tổng tiền thuốc CHỈ cho lịch hẹn (app) này
            const prescriptionCostForThisApp = app.prescriptions?.reduce((presSum, pres) => {
              // Chỉ tính các đơn thuốc thuộc LỊCH HẸN NÀY (quan trọng nếu 1 PMR có nhiều App)
              if (pres.appointmentId === app.id) {
                 const detailsSum = pres.prescriptionDetails?.reduce((detSum, det) => detSum + det.amount, 0) || 0;
                 return presSum + detailsSum;
              }
              return presSum; 
            }, 0) || 0;
            // So sánh tổng chi phí của Appointment này với totalAmount của Invoice
            return Math.abs((serviceCost + prescriptionCostForThisApp) - selectedInvoice.totalAmount) < 0.01; 
        });

        // 2. Lấy chi tiết thuốc CHỈ từ các đơn thuốc (prescriptions) thuộc về relevantAppointment
        const relevantPrescriptionDetails = relevantAppointment?.prescriptions?.flatMap(
          p => p.prescriptionDetails // Lấy tất cả details từ các prescriptions của appointment này
        ) || [];

        return (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            style={{ marginTop: 0 }}
          >
            <div className="bg-white rounded-xl p-6 w-full max-w-lg relative shadow-lg max-h-[90vh] flex flex-col">
              <button
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                onClick={() => setSelectedInvoice(null)}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" /> Chi tiết hóa đơn
              </h2>

              {/* Scrollable content for the modal */}
              <div className="flex-1 overflow-y-auto space-y-4 text-gray-700 pr-2">
                {/* Invoice ID */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <strong className="font-semibold w-32">Mã hóa đơn:</strong>
                  <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                    {selectedInvoice.id}
                  </p>
                </div>

                {/* Patient Name */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <User className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <strong className="font-semibold w-32">Bệnh nhân:</strong>
                  <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                    {selectedInvoice.patientMedicalRecord?.patient?.fullName || 'N/A'}
                  </p>
                </div>

                {/* Service */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <BriefcaseMedical className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <strong className="font-semibold w-32">Dịch vụ:</strong>
                  <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                    {/* SỬA: Truy cập mảng appointments[0] */}
                    {relevantAppointment?.medicalService?.name || 'N/A'}
                  </p>
                </div>

                {/* Service Cost */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <strong className="font-semibold w-32">Giá dịch vụ:</strong>
                  <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                    {/* SỬA: Truy cập mảng appointments[0] */}
                    {formatCurrency(relevantAppointment?.medicalService?.cost, 'VND')}
                  </p>
                </div>

                {/* Payment Date */}
                {selectedInvoice.paymentDate ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Calendar className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <strong className="font-semibold w-32">Ngày thanh toán:</strong>
                    <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                      {formatDbUtcToVnTime(selectedInvoice.paymentDate)}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Calendar className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <strong className="font-semibold w-32">Ngày thanh toán:</strong>
                    <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400">
                      Chưa có
                    </p>
                  </div>
                )}

                {/* Total Amount */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <DollarSign className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <strong className="font-semibold w-32">Tổng cộng:</strong>
                  <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                    {formatCurrency(selectedInvoice.totalAmount, 'VND')}
                  </p>
                </div>

                {/* Status */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className={`p-1 rounded-full ${getStatusColor(selectedInvoice.status)} flex-shrink-0`}>
                    {selectedInvoice.status ? <CheckCircle className="w-5 h-5 text-green-700" /> : <XCircle className="w-5 h-5 text-yellow-700" />}
                  </span>
                  <strong className="font-semibold w-32">Trạng thái:</strong>
                  <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                    {getStatusText(selectedInvoice.status)}
                  </p>
                </div>

                {/* Prescription Details */}
                {relevantPrescriptionDetails.length > 0 && (
                  <div className="pt-4 border-t border-gray-200 mt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-500" /> Chi tiết đơn thuốc
                    </h3>
                    <ul className="space-y-2">
                      {relevantPrescriptionDetails.map((detail) => (
                        <li key={detail.id} className="flex flex-col border border-gray-100 rounded-lg p-3 bg-white shadow-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-900 whitespace-nowrap flex items-center">
                              <Pill className="inline-block mr-1" /> {detail.medicine?.name || 'Thuốc không xác định'}
                            </span>
                            <span className="text-sm text-gray-600">x{detail.quantity}</span>
                          </div>
                          <p className="text-sm text-gray-600 italic">{formatCurrency(detail.medicine?.price, 'VND')} / {detail.medicine?.unit}</p>
                          <p className="text-sm text-gray-600 italic">{detail.dosage} ({detail.frequency})</p>
                          <p className="text-sm font-semibold text-gray-800 mt-1 self-end">
                            {formatCurrency(detail.amount, 'VND')}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={handleOpenPdfPreview}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md order-1 sm:order-2"
                >
                  <Printer className="w-5 h-5 mr-2" /> Xem trước & Xuất PDF
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* PDF Preview Modal */}
      {showPdfPreviewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl relative w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header của modal xem trước */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Xem trước Hóa đơn #{selectedInvoice.id}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md"
                >
                  <Download className="w-5 h-5 mr-2" /> Tải về PDF
                </button>
                <button
                  onClick={() => setShowPdfPreviewModal(false)}
                  className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Nội dung hóa đơn có thể cuộn */}
            <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#f9fafb' }}>
              <div
                ref={pdfContentRef}
                className="bg-white p-8 rounded-lg shadow-md mx-auto"
                style={{ maxWidth: '210mm', boxSizing: 'border-box' }}
              >
                {(() => {
                  // Lấy lại logic tìm relevantAppointment từ modal chi tiết
                  const relevantAppointment = selectedInvoice.patientMedicalRecord?.appointments?.find(app => {
                      const serviceCost = app.medicalService?.cost || 0;
                      const prescriptionCostForThisApp = app.prescriptions?.reduce((presSum, pres) => {
                        if (pres.appointmentId === app.id) {
                           const detailsSum = pres.prescriptionDetails?.reduce((detSum, det) => detSum + det.amount, 0) || 0;
                           return presSum + detailsSum;
                        }
                        return presSum; 
                      }, 0) || 0;
                      return Math.abs((serviceCost + prescriptionCostForThisApp) - selectedInvoice.totalAmount) < 0.01; 
                  });
                  
                  // Truyền relevantAppointment tìm được vào PrintableInvoice
                  return (
                    <PrintableInvoice 
                      invoice={selectedInvoice} 
                      relevantAppointment={relevantAppointment} // Truyền prop này
                      formatCurrency={formatCurrency} 
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;