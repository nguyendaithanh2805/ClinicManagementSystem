import React, { useState, useEffect } from 'react';
// (CẬP NHẬT) Thêm icon mới
import { 
  Calendar as CalendarIcon, Clock, User, ChevronDown, ChevronLeft, ChevronRight, X, Info, 
  CheckCircle, AlertTriangle, XCircle, DollarSign, Stethoscope, Edit, BriefcaseMedical,
  UserCheck, CircleCheckBig, UserX, Edit2, Search, Filter
} from 'lucide-react';
import { format, parseISO } from 'date-fns'; // Bỏ các import không dùng
import { vi } from 'date-fns/locale';
import { toast } from "react-toastify";
import api from "../../admins-layout/contexts/Api";
import DoctorSelectionModal from './DoctorSelectionModal';

const ITEMS_PER_PAGE = 5;

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentFilterStatus, setCurrentFilterStatus] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editedStaffId, setEditedStaffId] = useState('');
  const [editedStatus, setEditedStatus] = useState(''); 
  const [staffs, setStaffs] = useState([]);
  // State cho modal chọn bác sĩ
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [specialtiesList, setSpecialtiesList] = useState([]);

  useEffect(() => {
    fetchAppointments();
    fetchStaffs();
    fetchSpecialties();
  }, []);

  useEffect(() => {
     if (selectedAppointment) {
       setEditedStaffId(selectedAppointment.staff?.id || '');
       setEditedStatus(selectedAppointment.status);
     } else {
        setEditedStaffId('');
        setIsDoctorModalOpen(false);
     }
   }, [selectedAppointment]);

   const API_BASE_URL = import.meta.env.VITE_API_URL;
  const fetchSpecialties = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/specialties`);
      const result = await res.json();
      if (result.status && result.data) setSpecialtiesList(result.data);
      else toast.error(result.message || "Không thể tải chuyên khoa");
    } catch {
      toast.error("Lỗi kết nối đến server (chuyên khoa)");
    }
  };

  // Hàm helper để lấy các option trạng thái hợp lệ
  const getAllowedStatusOptions = (currentStatus) => {
    // Luôn bao gồm trạng thái hiện tại là lựa chọn đầu tiên và hợp lệ
    const options = [{ value: currentStatus, text: getStatusText(currentStatus) }];

    switch (currentStatus) {
      case 0: // Pending (Chờ xác nhận)
        options.push({ value: 1, text: getStatusText(1) }); // -> Confirmed
        options.push({ value: 5, text: getStatusText(5) }); // -> Cancelled
        break;
      case 1: // Confirmed (Đã xác nhận)
        options.push({ value: 2, text: getStatusText(2) }); // -> CheckedIn
        options.push({ value: 5, text: getStatusText(5) }); // -> Cancelled
        options.push({ value: 6, text: getStatusText(6) }); // -> NoShow
        break;
      case 2: // CheckedIn (Đã đến)
        options.push({ value: 3, text: getStatusText(3) }); // -> InProgress
        options.push({ value: 5, text: getStatusText(5) }); // -> Cancelled
        options.push({ value: 6, text: getStatusText(6) }); // -> NoShow
        break;
      case 3: // InProgress (Đang khám)
        options.push({ value: 4, text: getStatusText(4) }); // -> Completed
        options.push({ value: 5, text: getStatusText(5) }); // -> Cancelled
        break;
    }
    return options.sort((a, b) => a.value - b.value);
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/staff/appointments');
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

  const fetchStaffs = async () => {
    try {
      const response = await api.get('/staff/staffs');
      if (response.data.status) {
        setStaffs(response.data.data);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error(error.response.data.message || 'Lỗi khi lấy danh sách nhân viên:', error);
    }
  };

  /* (CẬP NHẬT) Trạng thái mới
  Pending = 0,      // Chờ xác nhận
  Confirmed = 1,    // Đã xác nhận
  CheckedIn = 2,    // Bệnh nhân đã đến
  InProgress = 3,   // Đang khám
  Completed = 4,    // Đã hoàn thành
  Cancelled = 5,    // Đã hủy
  NoShow = 6        // Không đến
  */

  // (CẬP NHẬT) Hàm getStatusText
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

  // (CẬP NHẬT) Hàm getStatusColorClass
  const getStatusColorClass = (status) => {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Pending
      case 1: return 'bg-green-100 text-green-700 border-green-200';   // Confirmed
      case 2: return 'bg-cyan-100 text-cyan-700 border-cyan-200';     // CheckedIn
      case 3: return 'bg-indigo-100 text-indigo-700 border-indigo-200'; // InProgress
      case 4: return 'bg-blue-100 text-blue-700 border-blue-200';      // Completed
      case 5: return 'bg-red-100 text-red-700 border-red-200';        // Cancelled
      case 6: return 'bg-gray-200 text-gray-800 border-gray-300';      // NoShow
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // (CẬP NHẬT) Hàm getStatusIcon
  const getStatusIcon = (status) => {
    switch (status) {
      case 0: return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 1: return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 2: return <UserCheck className="w-5 h-5 text-cyan-500" />;
      case 3: return <Stethoscope className="w-5 h-5 text-indigo-500" />;
      case 4: return <CircleCheckBig className="w-5 h-5 text-blue-500" />;
      case 5: return <XCircle className="w-5 h-5 text-red-500" />;
      case 6: return <UserX className="w-5 h-5 text-gray-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  // Filter appointments based on selected status (Giữ nguyên)
  const filteredAppointments = appointments.filter(apt => {
    if (currentFilterStatus === 'all') return true;
    return apt.status.toString() === currentFilterStatus;
  });

  // Pagination logic (Giữ nguyên)
  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleStatusFilterChange = (status) => {
    setCurrentFilterStatus(status);
    setCurrentPage(1); // Reset page when filter changes
  };

  // handleUpdateAppointment (Giữ nguyên, nó đã linh hoạt)
  const handleUpdateAppointment = async (newStatus = null) => {
    if (!selectedAppointment) return;

    const updatedData = {
      id: selectedAppointment.id, 
      patientId: selectedAppointment.patient?.id,
      staffId: editedStaffId ? parseInt(editedStaffId) : null, 
      status: newStatus !== null ? newStatus : editedStatus, 
    };

    if (!updatedData.staffId) {
      delete updatedData.staffId;
    }

    if (!updatedData.patientId) {
        delete updatedData.patientId;
    }

    try {
      const response = await api.patch(`/staff/appointments/${selectedAppointment.id}`, updatedData);
      if (response.data.status) {
        toast.success(`${response.data.message}`);
        fetchAppointments();
        setSelectedAppointment(null);
      } else {
        toast.error(response.data.message);
        console.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message)
      console.error('Lỗi khi cập nhật lịch hẹn:', error);
    }
  };

  // (CẬP NHẬT) Sửa lỗi .Id thành .id và thêm style badge
  const AppointmentCard = ({ appointment }) => (
    <div
      onClick={() => setSelectedAppointment(appointment)}
      className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 cursor-pointer transition-all duration-200 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-4"
    >
      <div className="flex-shrink-0 flex flex-col items-center w-20">
        <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
        </div>
        {/* (MỚI) Thêm badge cho ID */}
        <span className="mt-1.5 inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
          Mã LH: {appointment.id}
        </span>
      </div>

      <div className="flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {appointment.patient?.fullName || 'Chưa có bệnh nhân'}
            </h3>
            {/* Dòng `appointment.Id` đã bị xóa vì nó sai và đã được thay bằng badge */}
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <BriefcaseMedical className="w-4 h-4 inline-block text-gray-500" />
              {appointment.medicalService?.name || 'Chưa có dịch vụ'}
            </p>
          </div>
          <span className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColorClass(appointment.status)}`}>
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
            <Stethoscope className="w-4 h-4 text-gray-500" />
            <span>BS. {appointment.staff?.fullName || 'Chưa phân công'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Hàm mở modal chọn bác sĩ
  const openDoctorSelectionModal = () => {
    setIsDoctorModalOpen(true);
  };

  // Hàm xử lý khi chọn bác sĩ từ modal con
  const handleSelectDoctor = (staffId) => {
    setEditedStaffId(staffId); // Cập nhật ID bác sĩ đã chọn
    setIsDoctorModalOpen(false); // Đóng modal chọn bác sĩ
  };

  // Lấy tên bác sĩ đang được chọn (dựa trên editedStaffId) để hiển thị
  const selectedStaffName = staffs.find(s => s.id === editedStaffId)?.fullName || 'Chưa phân công';

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý lịch hẹn</h1>
        <p className="text-gray-500">Theo dõi danh sách và thông tin chi tiết</p>
      </div>

      {/* Appointment List Section */}
      <div className="bg-white rounded-xl shadow-sm p-5 mt-6"> {/* (MỚI) Thêm mt-6 */}
        <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
          <h3 className="text-xl font-semibold text-gray-800">Tất cả lịch hẹn</h3>
          
          {/* (CẬP NHẬT) Toàn bộ các nút filter */}
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
              onClick={() => handleStatusFilterChange('2')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                ${currentFilterStatus === '2' ? 'bg-cyan-600 text-white shadow-md' : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'}
              `}
            >
              Đã đến
            </button>
             <button
              onClick={() => handleStatusFilterChange('3')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                ${currentFilterStatus === '3' ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}
              `}
            >
              Đang khám
            </button>
            <button
              onClick={() => handleStatusFilterChange('4')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                ${currentFilterStatus === '4' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}
              `}
            >
              Hoàn thành
            </button>
            <button
              onClick={() => handleStatusFilterChange('5')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                ${currentFilterStatus === '5' ? 'bg-red-600 text-white shadow-md' : 'bg-red-50 text-red-700 hover:bg-red-100'}
              `}
            >
              Đã hủy
            </button>
             <button
              onClick={() => handleStatusFilterChange('6')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                ${currentFilterStatus === '6' ? 'bg-gray-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
            >
              Không đến
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {paginatedAppointments.length > 0 ? (
            paginatedAppointments.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">Không có lịch hẹn nào với trạng thái này.</p>
          )}
        </div>

        {/* Pagination Controls (Giữ nguyên) */}
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

      {/* Appointment Detail & Edit Modal */}
      {selectedAppointment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ marginTop: 0 }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-lg relative shadow-lg">
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              onClick={() => setSelectedAppointment(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 flex items-center gap-2">
              <Edit className="w-6 h-6 text-blue-600" /> Chi tiết lịch hẹn
            </h2>

            <div className="space-y-4 text-gray-700">
              {/* Patient Name - Read-only */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <User className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <strong className="font-semibold w-24">Bệnh nhân:</strong>
                <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  {selectedAppointment.patient?.fullName || 'N/A'}
                </p>
              </div>

              {/* Service - Read-only */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <BriefcaseMedical className="w-5 h-5 text-green-500 flex-shrink-0" />
                <strong className="font-semibold w-24">Dịch vụ:</strong>
                <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  {selectedAppointment.medicalService?.name || 'N/A'}
                </p>
              </div>

              {/* (CẬP NHẬT) Staff - Hiển thị có điều kiện */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Stethoscope className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <label className="font-semibold w-24">Bác sĩ:</label>

                {/* Kiểm tra nếu trạng thái là 0 (Chờ xác nhận) */}
                {selectedAppointment.status === 0 ? (
                  // Hiển thị tên BS hiện tại và nút chọn
                  <div className="flex-1 flex items-center justify-between border border-gray-200 rounded-lg bg-gray-50 px-3 py-1.5">
                    <span className="font-medium text-gray-800">
                       {selectedStaffName} {/* Hiển thị tên BS đã chọn */}
                    </span>
                    <button
                      onClick={openDoctorSelectionModal}
                      className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded hover:bg-blue-200 flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Chọn
                    </button>
                  </div>
                ) : (
                  // Hiển thị text tên bác sĩ (chỉ đọc)
                  <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 font-medium">
                    {selectedAppointment.staff?.fullName || 'Chưa phân công'}
                  </p>
                )}
              </div>

              {/* Appointment Date - Read-only */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <strong className="font-semibold w-24">Ngày hẹn:</strong>
                <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  {format(new Date(selectedAppointment.appointmentDate), 'dd/MM/yyyy')}
                </p>
              </div>

              {/* Appointment Time - Read-only */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <strong className="font-semibold w-24">Thời gian:</strong>
                <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  {selectedAppointment.appointmentTime}
                </p>
              </div>

              {/* (CẬP NHẬT) Dropdown trạng thái */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Luôn hiển thị Icon của trạng thái gốc */}
                {getStatusIcon(selectedAppointment.status)}
                <label htmlFor="status" className="font-semibold w-24">Trạng thái:</label>

                {/* Kiểm tra nếu là trạng thái cuối (4, 5, 6) */}
                {[4, 5, 6].includes(selectedAppointment.status) ? (
                  // Hiển thị dạng text, không cho sửa
                  <p className={`flex-1 px-3 py-2 border rounded-lg ${getStatusColorClass(selectedAppointment.status)} bg-opacity-70 font-medium`}>
                    {getStatusText(selectedAppointment.status)} (Không thể thay đổi)
                  </p>
                ) : (
                  // Hiển thị dropdown với các option hợp lệ
                  <select
                    id="status"
                    value={editedStatus} // Vẫn dùng editedStatus để control value
                    onChange={(e) => setEditedStatus(parseInt(e.target.value))}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {/* Tạo options từ hàm helper */}
                    {getAllowedStatusOptions(selectedAppointment.status).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.text}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Cost - Read-only (Giữ nguyên) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <DollarSign className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <strong className="font-semibold w-24">Chi phí:</strong>
                <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  {selectedAppointment.medicalService?.cost?.toLocaleString('vi-VN') || 'N/A'} VNĐ
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
              {/* Chỉ hiển thị nút Lưu nếu trạng thái không phải là trạng thái cuối */}
              {![4, 5, 6].includes(selectedAppointment.status) && (
                <button
                  onClick={() => handleUpdateAppointment(null)} // Lưu trạng thái đã chọn trong editedStatus
                  className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md"
                  disabled={selectedAppointment.status === 0 && !editedStaffId}
                >
                  <Edit className="w-5 h-5 mr-2" /> Lưu thay đổi
                </button>
              )}
               {/* Nút Đóng luôn hiển thị (hoặc thay bằng nút Hủy) */}
               {/* <button onClick={() => setSelectedAppointment(null)} className="...">Đóng</button> */}
            </div>
          </div>
        </div>
      )}

      {/* Render DoctorSelectionModal */}
      {isDoctorModalOpen && selectedAppointment && (
        <DoctorSelectionModal
          isOpen={isDoctorModalOpen}
          onClose={() => setIsDoctorModalOpen(false)}
          staffs={staffs}
          specialties={specialtiesList}
          onSelectDoctor={handleSelectDoctor}
          currentStaffId={editedStaffId} // Truyền ID hiện tại để highlight
        />
      )}
    </div>
  );
};

export default AppointmentsPage;