import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, DollarSign, Plus, Filter, Search, Calendar, CheckCircle, XCircle, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

const PaymentsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const payments = [
    {
      id: 'pay001',
      date: parseISO('2023-10-26T10:00:00'),
      amount: 550000,
      currency: 'VND',
      description: 'Khám định kỳ - BS. Trần Thị Bình',
      patient: user?.role === 'patient' ? null : 'Nguyễn Văn An',
      service: 'Khám tổng quát',
      method: 'Chuyển khoản',
      status: 'paid',
      invoiceId: 'INV-20231026-001',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'pay002',
      date: parseISO('2023-10-25T14:30:00'),
      amount: 1200000,
      currency: 'VND',
      description: 'Phẫu thuật nhỏ - BS. Lê Văn Cường',
      patient: user?.role === 'patient' ? null : 'Trần Thị Mai',
      service: 'Phẫu thuật răng khôn',
      method: 'Tiền mặt',
      status: 'pending',
      invoiceId: 'INV-20231025-002',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'pay003',
      date: parseISO('2023-10-24T09:00:00'),
      amount: 300000,
      currency: 'VND',
      description: 'Tái khám da liễu - BS. Phạm Thị Hoa',
      patient: user?.role === 'patient' ? null : 'Lê Minh Tuấn',
      service: 'Tư vấn da liễu',
      method: 'Thẻ tín dụng',
      status: 'paid',
      invoiceId: 'INV-20231024-003',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'pay004',
      date: parseISO('2023-10-23T16:00:00'),
      amount: 700000,
      currency: 'VND',
      description: 'Xét nghiệm máu tổng quát',
      patient: user?.role === 'patient' ? null : 'Phạm Thị Thảo',
      service: 'Xét nghiệm',
      method: 'Chuyển khoản',
      status: 'cancelled',
      invoiceId: 'INV-20231023-004',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const filteredPayments = payments.filter(pay => {
    const matchesSearch = searchTerm === '' || 
      (pay.patient && pay.patient.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pay.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || pay.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-medical-900 mb-2">
              {user?.role === 'patient' ? 'Lịch sử thanh toán của tôi' : 'Quản lý thanh toán'}
            </h1>
            <p className="text-medical-600">
              {user?.role === 'patient' 
                ? 'Xem và quản lý các giao dịch thanh toán của bạn'
                : 'Quản lý tất cả các giao dịch thanh toán của bệnh viện'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medical-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-4 py-2 border border-medical-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm appearance-none bg-white"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="pending">Chờ thanh toán</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            <button className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tạo hóa đơn mới
            </button>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-medical-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm w-full"
              placeholder="Tìm kiếm giao dịch, bệnh nhân, dịch vụ..."
            />
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-medical-900">
            Danh sách giao dịch
          </h2>
          <div className="flex items-center gap-2 text-sm text-medical-600">
            <CreditCard className="w-4 h-4" />
            <span>{filteredPayments.length} giao dịch</span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="border border-medical-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-medical-600">
                    {format(payment.date, 'dd/MM')}
                  </span>
                </div>

                {payment.avatar && (
                  <img
                    src={payment.avatar}
                    alt={payment.patient || 'Patient/Staff'}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                )}
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-medical-900 mb-1">
                        {user?.role === 'patient' ? payment.description : payment.patient || payment.description}
                      </h3>
                      <p className="text-sm text-medical-600 mb-1">
                        {payment.service} • {payment.method}
                      </p>
                      <p className="text-sm text-medical-500">
                        Mã hóa đơn: {payment.invoiceId}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                      <p className="font-bold text-medical-900 text-lg mt-1">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div className="flex items-center gap-2 text-sm text-medical-600">
                      <Calendar className="w-4 h-4" />
                      <span>{format(payment.date, 'HH:mm dd/MM/yyyy', { locale: vi })}</span>
                    </div>
                    {user?.role !== 'patient' && payment.patient && (
                      <div className="flex items-center gap-2 text-sm text-medical-600">
                        <User className="w-4 h-4" />
                        <span>Bệnh nhân: {payment.patient}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-medical-100">
                    <div className="flex gap-2">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Xem chi tiết hóa đơn
                      </button>
                    </div>
                    {user?.role !== 'patient' && (
                      <div className="flex gap-2">
                        {payment.status === 'pending' && (
                          <button className="text-sm text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Xác nhận thanh toán
                          </button>
                        )}
                        {payment.status !== 'cancelled' && (
                          <button className="text-sm text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Hủy
                          </button>
                        )}
                        <button className="btn-secondary text-sm py-2 px-4">
                          Chỉnh sửa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-medical-300 mx-auto mb-4" />
            <p className="text-medical-600">
              {searchTerm || filterStatus !== 'all' ? 'Không tìm thấy giao dịch nào phù hợp' : 'Chưa có giao dịch thanh toán nào'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;