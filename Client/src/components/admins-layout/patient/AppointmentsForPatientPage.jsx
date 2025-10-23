import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, BriefcaseMedical, X, Info, CheckCircle, AlertTriangle, XCircle, DollarSign, Trash2, ShieldOff } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "react-toastify";
import api from "../contexts/Api";

const AppointmentsForPatientPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentFilterStatus, setCurrentFilterStatus] = useState('all');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/patients/appointments/me');
      if (response.data.status) {
        setAppointments(response.data.data);
      } else {
        toast.error(response.data.message || 'Không thể tải lịch hẹn.');
        console.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Lỗi khi kết nối đến máy chủ khi tải lịch hẹn.');
      console.error('Lỗi khi lấy lịch hẹn:', error);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Chờ xác nhận';
      case 1: return 'Đã xác nhận';
      case 2: return 'Bệnh nhân đã đến';
      case 3: return 'Đang khám';
      case 4: return 'Đã hoàn thành';
      case 5: return 'Đã hủy';
      case 6: return 'Không đến';
      default: return 'Không xác định';
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Pending
      case 1: return 'bg-green-100 text-green-700 border-green-200';   // Confirmed
      case 2: return 'bg-cyan-100 text-cyan-700 border-cyan-200';     // CheckedIn
      case 3: return 'bg-indigo-100 text-indigo-700 border-indigo-200'; // InProgress
      case 4: return 'bg-blue-100 text-blue-700 border-blue-200';      // Completed
      case 5: return 'bg-red-100 text-red-700 border-red-200';        // Cancelled
      case 6: return 'bg-gray-100 text-gray-700 border-gray-200';      // NoShow
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (currentFilterStatus === 'all') return true;
    return apt.status.toString() === currentFilterStatus;
  });

  const handleStatusFilterChange = (status) => {
    setCurrentFilterStatus(status);
  };

  const handleDeleteClick = (appointment) => {
    if (appointment.status === 0) {
      setAppointmentToDelete(appointment);
      setShowDeleteConfirmModal(true);
    } else {
      toast.info('Chỉ có thể hủy lịch hẹn ở trạng thái "Chờ xác nhận".');
    }
  };

  const confirmDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    try {
      const response = await api.delete(`/patients/appointments/${appointmentToDelete.id}`);
      if (response.status == 204) {
        toast.success('Lịch hẹn đã được hủy thành công.');
        fetchAppointments();
        setShowDeleteConfirmModal(false);
        setAppointmentToDelete(null);
      } else {
        toast.error('Không thể xóa lịch hẹn.');
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Lỗi khi kết nối đến máy chủ để hủy lịch hẹn.');
      console.error('Lỗi khi hủy lịch hẹn:', error);
    }
  };

  const AppointmentCard = ({ appointment }) => (
    <div
      className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white flex flex-col sm:flex-row items-start sm:items-center gap-4 relative"
    >
      {/* Delete Button - Conditional rendering */}
      {appointment.status === 0 ? (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click event
            handleDeleteClick(appointment);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200 z-10"
          title="Hủy lịch hẹn"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      ) : (
        <div
          className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed"
          title="Không thể hủy lịch hẹn ở trạng thái này"
        >
          <ShieldOff className="w-5 h-5" />
        </div>
      )}

      <div className="flex-shrink-0">
        <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {appointment.medicalService?.name || 'Chưa có dịch vụ'}
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <User className="w-4 h-4 inline-block text-gray-500" />
              BS. {appointment.staff?.fullName || 'Chưa phân công'}
            </p>
          </div>
          <span className={`mt-2 mr-4 sm:mt-0 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColorClass(appointment.status)}`}>
            {getStatusText(appointment.status)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{appointment.appointmentTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <span>{format(new Date(appointment.appointmentDate), 'dd/MM/yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Chi phí: {appointment.medicalService?.cost?.toLocaleString('vi-VN') || 'N/A'} VNĐ</span>
          </div>
        </div>
      </div>
    </div>
  );


  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lịch hẹn của tôi</h1>
        <p className="text-gray-500">Xem và quản lý các lịch hẹn đã đặt</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 mt-6">
        <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
          <h3 className="text-xl font-semibold text-gray-800">Tất cả lịch hẹn</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleStatusFilterChange('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                ${currentFilterStatus === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleStatusFilterChange('0')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                ${currentFilterStatus === '0' ? 'bg-yellow-500 text-white shadow-md' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}
              `}
            >
              Chờ xác nhận
            </button>
            <button
              onClick={() => handleStatusFilterChange('1')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                ${currentFilterStatus === '1' ? 'bg-green-600 text-white shadow-md' : 'bg-green-50 text-green-700 hover:bg-green-100'}
              `}
            >
              Đã xác nhận
            </button>
            <button
              onClick={() => handleStatusFilterChange('3')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                ${currentFilterStatus === '3' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}
              `}
            >
              Hoàn thành
            </button>
            <button
              onClick={() => handleStatusFilterChange('2')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                ${currentFilterStatus === '2' ? 'bg-red-600 text-white shadow-md' : 'bg-red-50 text-red-700 hover:bg-red-100'}
              `}
            >
              Đã hủy bởi nhân viên
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">Không có lịch hẹn nào với trạng thái này.</p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && appointmentToDelete && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ marginTop: 0 }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-sm relative shadow-lg">
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              onClick={() => setShowDeleteConfirmModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Hủy lịch hẹn</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn hủy lịch hẹn cho dịch vụ <b>{appointmentToDelete.medicalService?.name}</b> vào ngày <b>{format(new Date(appointmentToDelete.appointmentDate), 'dd/MM/yyyy')}</b>?
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  Không
                </button>
                <button
                  onClick={confirmDeleteAppointment}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Có, Hủy lịch hẹn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsForPatientPage;