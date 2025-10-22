import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, MapPin, ChevronLeft, ChevronRight, X, Info, CheckCircle, AlertTriangle, XCircle, DollarSign, Stethoscope, Edit, BriefcaseMedical } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, isToday, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from "react-toastify";
import api from "../../admins-layout/contexts/Api"; // Assuming the API path is correct

const ITEMS_PER_PAGE = 5; // Number of appointments per page

const AppointmentPageForDoctor = () => {
  const [myAppointments, setMyAppointments] = useState([]);
  // Initialize with '1' (Confirmed) or '3' (Completed) or 'all' if you want to show both initially
  const [currentFilterStatus, setCurrentFilterStatus] = useState('all'); // 'all' | '1' | '3'
  const [selectedAppointment, setSelectedAppointment] = useState(null); // To open detail/edit modal
  const [currentPage, setCurrentPage] = useState(1);

  // State for editable appointment details (only status is editable now for personal view)
  const [editedStatus, setEditedStatus] = useState(''); // Holds the new status if changed via buttons or dropdown

  // States for weekly calendar view
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { locale: vi, weekStartsOn: 1 })); // Week starts on Monday
  const [selectedDateForCalendar, setSelectedDateForCalendar] = useState(null); // The date clicked on the calendar for detail view
  const [showDailyAppointmentsModal, setShowDailyAppointmentsModal] = useState(false);

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  // When a new appointment is selected for editing, initialize the edit states
  useEffect(() => {
    if (selectedAppointment) {
      setEditedStatus(selectedAppointment.status); // Initialize with current status
    }
  }, [selectedAppointment]);

  const fetchMyAppointments = async () => {
    try {
      const response = await api.get('/staff/appointments/me'); // Changed endpoint to personal appointments
      if (response.data.status) {
        setMyAppointments(response.data.data);
      } else {
        toast.error(response.data.message || 'Không thể tải lịch hẹn cá nhân.');
        console.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Lỗi khi kết nối đến máy chủ khi tải lịch hẹn cá nhân.');
      console.error('Lỗi khi lấy lịch hẹn cá nhân:', error);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Chờ xác nhận';
      case 1: return 'Đã xác nhận';
      case 2: return 'Đã hủy';
      case 3: return 'Hoàn thành';
      default: return 'Không xác định';
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Pending
      case 1: return 'bg-green-100 text-green-700 border-green-200';   // Confirmed
      case 2: return 'bg-red-100 text-red-700 border-red-200';      // Cancelled
      case 3: return 'bg-blue-100 text-blue-700 border-blue-200';     // Completed
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 0: return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 1: return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 2: return <XCircle className="w-5 h-5 text-red-500" />;
      case 3: return <CalendarIcon className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  // --- Calendar Logic ---
  const daysOfWeek = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { locale: vi, weekStartsOn: 1 })
  });

  const getAppointmentsCountForDay = (date) => {
    return myAppointments.filter(apt =>
      (apt.status === 1 || apt.status === 3) && // Only count confirmed and completed for calendar
      isSameDay(parseISO(apt.appointmentDate), date)
    ).length;
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    setSelectedDateForCalendar(null); // Clear selected date when changing week
    setShowDailyAppointmentsModal(false); // Close modal if open
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
    setSelectedDateForCalendar(null); // Clear selected date when changing week
    setShowDailyAppointmentsModal(false); // Close modal if open
  };

  // Modified: When a day is clicked, open a modal with appointments for that day
  const handleDayClick = (date) => {
    setSelectedDateForCalendar(date);
    setShowDailyAppointmentsModal(true);
  };
  // --- End Calendar Logic ---

  // Filter appointments based on selected status for the main list
  const filteredAppointments = myAppointments.filter(apt => {
    // Only show Confirmed (1) and Completed (3) appointments by default or when filtered
    const isAllowedStatus = apt.status === 1 || apt.status === 3;
    if (currentFilterStatus === 'all') {
      return isAllowedStatus;
    } else {
      return isAllowedStatus && apt.status.toString() === currentFilterStatus;
    }
  });


  // Pagination logic for the main list
  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleStatusFilterChange = (status) => {
    // Ensure only 'all', '1', '3' are allowed for filtering
    if (status === 'all' || status === '1' || status === '3') {
      setCurrentFilterStatus(status);
      setCurrentPage(1); // Reset page when filter changes
    }
  };

  const handleUpdateAppointment = async (newStatus = null) => {
    if (!selectedAppointment) return;

    // Doctor can only update to Confirmed (1) or Completed (3)
    const statusToUpdate = newStatus !== null ? newStatus : editedStatus;
    if (statusToUpdate !== 1 && statusToUpdate !== 3) {
      toast.error('Bác sĩ chỉ có thể cập nhật trạng thái "Đã xác nhận" hoặc "Hoàn thành".');
      return;
    }

    const updatedData = {
      id: selectedAppointment.id,
      status: statusToUpdate,
    };

    try {
      const response = await api.patch(`/staff/appointments/${selectedAppointment.id}`, updatedData);
      if (response.data.status) {
        toast.success(`${response.data.message}`);
        fetchMyAppointments(); // Re-fetch personal appointments to update the list
        setSelectedAppointment(null); // Close modal
        setShowDailyAppointmentsModal(false); // Also close daily modal if it was open
      } else {
        toast.error(response.data.message);
        console.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Lỗi khi cập nhật lịch hẹn.');
      console.error('Lỗi khi cập nhật lịch hẹn:', error);
    }
  };

  const AppointmentCard = ({ appointment, onClick }) => (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 cursor-pointer transition-all duration-200 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-4"
    >
      <div className="flex-shrink-0">
        <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {appointment.patient?.fullName || 'Chưa có bệnh nhân'}
            </h3>
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
          {/* Staff is current user, no need to display staff name unless it's for verification */}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lịch hẹn cá nhân</h1>
        <p className="text-gray-500">Quản lý các cuộc hẹn của bạn</p>
      </div>

      {/* Weekly Calendar Section */}
      <div className="bg-white rounded-xl shadow-sm p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevWeek}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            Tuần từ {format(currentWeekStart, 'dd/MM', { locale: vi })} - {format(endOfWeek(currentWeekStart, { locale: vi, weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: vi })}
          </h2>
          <button
            onClick={handleNextWeek}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {daysOfWeek.map(day => (
            <div
              key={day.toISOString()}
              onClick={() => handleDayClick(day)} // Modified: Opens modal
              className={`p-3 rounded-lg cursor-pointer transition-colors duration-200
                ${isSameDay(day, new Date()) ? 'bg-blue-200 text-blue-800 font-bold' : ''}
                ${isSameDay(day, selectedDateForCalendar) ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 hover:bg-gray-100'}
                ${getAppointmentsCountForDay(day) > 0 ? 'border border-blue-400' : 'border border-transparent'}
              `}
            >
              <div className="text-sm font-medium">
                {format(day, 'E', { locale: vi }).toUpperCase()} {/* Mon, Tue, etc. */}
              </div>
              <div className="text-xl font-semibold mt-1">
                {format(day, 'dd', { locale: vi })}
              </div>
              {getAppointmentsCountForDay(day) > 0 && (
                <div className={`mt-1 text-xs font-bold px-2 py-0.5 rounded-full inline-block
                  ${isSameDay(day, selectedDateForCalendar) ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}
                `}>
                  {getAppointmentsCountForDay(day)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Appointment List Section (now independent of calendar day selection) */}
      <div className="bg-white rounded-xl shadow-sm p-5 mt-6">
        <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
          <h3 className="text-xl font-semibold text-gray-800">
            Lịch hẹn của bạn
          </h3>
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
            {/* Removed buttons for 'Chờ xác nhận' (0) and 'Đã hủy' (2) */}
          </div>
        </div>

        <div className="space-y-4">
          {paginatedAppointments.length > 0 ? (
            paginatedAppointments.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} onClick={() => setSelectedAppointment(apt)} />
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              Không có lịch hẹn nào với trạng thái đã chọn.
            </p>
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

              {/* Staff - Read-only (it's "me") */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Stethoscope className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <strong className="font-semibold w-24">Bác sĩ:</strong>
                <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  {selectedAppointment.staff?.fullName || 'Bạn (chưa có thông tin)'}
                </p>
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

              {/* Current Status - Display and editable via dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {getStatusIcon(editedStatus)}
                <label htmlFor="status" className="font-semibold w-24">Trạng thái:</label>
                <select
                  id="status"
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(parseInt(e.target.value))}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {/* Doctor can only change to Confirmed or Completed */}
                  <option value={1}>Đã xác nhận</option>
                  <option value={3}>Hoàn thành</option>
                </select>
              </div>

              {/* Cost - Read-only (derived from selected service) */}
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
              <button
                onClick={() => handleUpdateAppointment()} // Save status from dropdown
                className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md"
              >
                <Edit className="w-5 h-5 mr-2" /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Appointments Modal */}
      {showDailyAppointmentsModal && selectedDateForCalendar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ marginTop: 0 }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative shadow-lg max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              onClick={() => setShowDailyAppointmentsModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-blue-600" /> Chi tiết lịch hẹn ngày {format(selectedDateForCalendar, 'dd/MM/yyyy', { locale: vi })}
            </h2>

            <div className="space-y-4">
              {myAppointments
                .filter(apt =>
                  (apt.status === 1 || apt.status === 3) && // Only show Confirmed and Completed in daily modal
                  isSameDay(parseISO(apt.appointmentDate), selectedDateForCalendar)
                )
                .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime)) // Sort by time
                .map(apt => (
                  <AppointmentCard key={apt.id} appointment={apt} onClick={() => {
                    setSelectedAppointment(apt);
                    // No need to close daily modal if we want to allow quick edits from here
                    // setShowDailyAppointmentsModal(false);
                  }} />
                ))
              }
              {myAppointments.filter(apt =>
                (apt.status === 1 || apt.status === 3) &&
                isSameDay(parseISO(apt.appointmentDate), selectedDateForCalendar)
              ).length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Không có lịch hẹn đã xác nhận hoặc đã hoàn thành vào ngày này.
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDailyAppointmentsModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentPageForDoctor;