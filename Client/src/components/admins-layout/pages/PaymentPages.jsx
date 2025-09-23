import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Assuming AuthContext is available
import { CreditCard, DollarSign, BriefcaseMedical , Filter, Search, Calendar, CheckCircle, XCircle, User, FileText, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from "react-toastify";
import api from "../../admins-layout/contexts/Api"; // Correct API import

const ITEMS_PER_PAGE = 5; // Number of invoices per page

const PaymentsPage = () => {
  const { user } = useAuth(); // Assuming useAuth provides user role
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'paid', 'pending'
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null); // For detail/edit modal

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/staff/invoices');
      if (response.data.status) {
        setInvoices(response.data.data);
      } else {
        toast.error(response.data.message || 'Không thể tải hóa đơn.');
        console.error(response.data.message);
      }
    } catch (error) {
      toast.error('Lỗi khi kết nối đến máy chủ khi tải hóa đơn.');
      console.error('Lỗi khi lấy hóa đơn:', error);
    }
  };

  const getStatusText = (status) => {
    // API status: true = paid, false = pending/cancelled (assuming false is pending for now)
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

  const handleUpdateInvoiceStatus = async (invoiceId, newStatus) => {
    try {
      const response = await api.patch(`/staff/invoices/${invoiceId}`, {
        Id: invoiceId,
        Status: newStatus,
      });

      if (response.data.status) {
        toast.success(response.data.message || 'Cập nhật trạng thái hóa đơn thành công!');
        fetchInvoices(); // Re-fetch to update the list
        setSelectedInvoice(null); // Close modal if open
      } else {
        toast.error(response.data.message || 'Không thể cập nhật trạng thái hóa đơn.');
        console.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật hóa đơn.');
      console.error('Error updating invoice status:', error);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const patientName = invoice.appointment?.patient?.fullName || '';
    const medicalService = invoice.appointment?.medicalService?.name || '';
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

  // Pagination logic
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
                {invoice.appointment?.patient?.fullName || 'Bệnh nhân không xác định'}
              </h3>
              <p className="text-sm text-medical-600 mb-1">
                {invoice.appointment?.medicalService?.name || 'Dịch vụ không xác định'}
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
                <span>{format(parseISO(invoice.paymentDate), 'HH:mm dd/MM/yyyy', { locale: vi })}</span>
              </div>
            )}
            {invoice.appointment?.patient?.fullName && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Bệnh nhân: {invoice.appointment.patient.fullName}</span>
              </div>
            )}
          </div>

          {user?.role !== 'patient' && (
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-medical-100">
              {invoice.status === false && ( // Only show if pending (false)
                <button
                  onClick={(e) => { e.stopPropagation(); handleUpdateInvoiceStatus(invoice.id, true); }}
                  className="text-sm text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" /> Xác nhận thanh toán
                </button>
              )}
              {/* <button className="btn-secondary text-sm py-2 px-4">
                Chỉnh sửa
              </button> */}
            </div>
          )}
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
                {/* <option value="cancelled">Đã hủy</option> // Add if API supports distinct cancelled status */}
              </select>
            </div>
            {/* <button className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tạo hóa đơn mới
            </button> */}
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
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-full text-sm font-medium
                  ${currentPage === page ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg relative shadow-lg">
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              onClick={() => setSelectedInvoice(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" /> Chi tiết hóa đơn
            </h2>

            <div className="space-y-4 text-gray-700">
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
                  {selectedInvoice.appointment?.patient?.fullName || 'N/A'}
                </p>
              </div>

              {/* Service */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <BriefcaseMedical className="w-5 h-5 text-green-500 flex-shrink-0" />
                <strong className="font-semibold w-32">Dịch vụ:</strong>
                <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  {selectedInvoice.appointment?.medicalService?.name || 'N/A'}
                </p>
              </div>

              {/* Payment Date */}
              {selectedInvoice.paymentDate && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Calendar className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <strong className="font-semibold w-32">Ngày thanh toán:</strong>
                  <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                    {format(parseISO(selectedInvoice.paymentDate), 'HH:mm dd/MM/yyyy', { locale: vi })}
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
            </div>

            {/* Action Buttons */}
            {user?.role !== 'patient' && selectedInvoice.status === false && (
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => handleUpdateInvoiceStatus(selectedInvoice.id, true)}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md"
                >
                  <CheckCircle className="w-5 h-5 mr-2" /> Xác nhận thanh toán
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;