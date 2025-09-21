import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Plus, Filter, Search, User, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { vi } from 'date-fns/locale';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilterStatus, setCurrentFilterStatus] = useState('all'); // 'all', 'confirmed', 'pending', 'completed', 'cancelled'

  // Dữ liệu mẫu lịch hẹn
  const allAppointments = [
    {
      id: 'apt001',
      date: new Date(),
      time: '09:00',
      duration: 30,
      patient: user?.role === 'patient' ? null : 'Nguyễn Văn An',
      doctor: user?.role === 'patient' ? 'BS. Trần Thị Bình' : null,
      department: 'Nội khoa - Tim mạch',
      room: 'Phòng 201',
      status: 'confirmed',
      type: 'Khám định kỳ',
      notes: 'Kiểm tra huyết áp',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'apt002',
      date: addDays(new Date(), 1), // Ngày mai
      time: '14:30',
      duration: 45,
      patient: user?.role === 'patient' ? null : 'Trần Thị Mai',
      doctor: user?.role === 'patient' ? 'BS. Lê Văn Cường' : null,
      department: 'Ngoại khoa',
      room: 'Phòng 105',
      status: 'pending',
      type: 'Tái khám',
      notes: 'Theo dõi sau phẫu thuật',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'apt003',
      date: addDays(new Date(), 2), // Hai ngày tới
      time: '10:15',
      duration: 60,
      patient: user?.role === 'patient' ? null : 'Lê Minh Tuấn',
      doctor: user?.role === 'patient' ? 'BS. Phạm Thị Hoa' : null,
      department: 'Da liễu',
      room: 'Phòng 301',
      status: 'confirmed',
      type: 'Khám chuyên khoa',
      notes: 'Điều trị mụn trứng cá',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'apt004',
      date: subDays(new Date(), 3), // Ba ngày trước
      time: '11:00',
      duration: 20,
      patient: user?.role === 'patient' ? null : 'Phạm Thị Thúy',
      doctor: user?.role === 'patient' ? 'BS. Nguyễn Văn Hùng' : null,
      department: 'Nhi khoa',
      room: 'Phòng 205',
      status: 'completed',
      type: 'Tiêm chủng',
      notes: 'Tiêm vắc xin 6 trong 1',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'apt005',
      date: new Date(), // Hôm nay
      time: '16:00',
      duration: 40,
      patient: user?.role === 'patient' ? null : 'Nguyễn Thu Trang',
      doctor: user?.role === 'patient' ? 'BS. Hoàng Gia Minh' : null,
      department: 'Răng hàm mặt',
      room: 'Phòng 401',
      status: 'pending',
      type: 'Nhổ răng khôn',
      notes: 'Khám tổng quát răng miệng',
      avatar: 'https://images.unsplash.com/photo-1620023611388-3449339798e3?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'apt006',
      date: addDays(new Date(), 3), // Ba ngày tới
      time: '08:30',
      duration: 50,
      patient: user?.role === 'patient' ? null : 'Vũ Đình Mạnh',
      doctor: user?.role === 'patient' ? 'BS. Đỗ Thị Lan' : null,
      department: 'Phục hồi chức năng',
      room: 'Phòng 101',
      status: 'confirmed',
      type: 'Vật lý trị liệu',
      notes: 'Theo dõi sau chấn thương đầu gối',
      avatar: 'https://images.unsplash.com/photo-1570197591456-dfd635df0c1c?w=150&h=150&fit=crop&crop=face'
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return 'Không xác định';
    }
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
    end: endOfWeek(selectedDate, { weekStartsOn: 1 })
  });

  const handlePreviousWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };

  const handleNextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  // Lọc lịch hẹn theo từ khóa tìm kiếm và trạng thái
  const filteredAppointments = allAppointments.filter(apt => {
    const matchesSearch = searchTerm === '' ||
      (apt.patient && apt.patient.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (apt.doctor && apt.doctor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      apt.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = currentFilterStatus === 'all' || apt.status === currentFilterStatus;

    return matchesSearch && matchesStatus;
  });

  // Chia các lịch hẹn đã lọc ra theo trạng thái
  const confirmedAppointments = filteredAppointments.filter(apt => apt.status === 'confirmed');
  const pendingAppointments = filteredAppointments.filter(apt => apt.status === 'pending');
  const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed');
  const cancelledAppointments = filteredAppointments.filter(apt => apt.status === 'cancelled'); // Thêm trạng thái đã hủy

  const AppointmentCard = ({ appointment }) => (
    <div className="border border-medical-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200 bg-white">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-xs font-medium text-medical-600">
            {format(appointment.date, 'dd/MM')}
          </span>
        </div>

        {(appointment.patient || appointment.doctor) && (
          <img
            src={appointment.avatar}
            alt={appointment.patient || appointment.doctor}
            className="w-12 h-12 rounded-xl object-cover"
          />
        )}

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-medical-900 mb-1">
                {user?.role === 'patient' ? appointment.doctor : appointment.patient}
              </h3>
              <p className="text-sm text-medical-600 mb-1">
                {appointment.department} • {appointment.type}
              </p>
              <p className="text-sm text-medical-500">
                {appointment.notes}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
              {getStatusText(appointment.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div className="flex items-center gap-2 text-sm text-medical-600">
              <Clock className="w-4 h-4" />
              <span>{appointment.time} ({appointment.duration}p)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-medical-600">
              <MapPin className="w-4 h-4" />
              <span>{appointment.room}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-medical-600">
              <User className="w-4 h-4" />
              <span>{appointment.department}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-medical-100">
            <div className="flex gap-2">
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Chi tiết
              </button>
              {appointment.status === 'pending' && (
                <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Xác nhận
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary text-sm py-2 px-4">
                Chỉnh sửa
              </button>
              {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Hủy
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-effect rounded-2xl p-6 bg-white shadow-soft">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-medical-900 mb-2">
              {user?.role === 'patient' ? 'Lịch khám của tôi' : 'Quản lý lịch hẹn'}
            </h1>
            <p className="text-medical-600">
              {user?.role === 'patient'
                ? 'Xem và quản lý các lịch khám của bạn'
                : 'Quản lý lịch hẹn và lịch làm việc'
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="btn-secondary inline-flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Lọc
            </button>
            <button className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {user?.role === 'patient' ? 'Đặt lịch mới' : 'Tạo lịch hẹn'}
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="glass-effect rounded-2xl p-6 bg-white shadow-soft">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={handlePreviousWeek} className="p-2 rounded-full hover:bg-medical-100 transition-colors">
              <ChevronLeft className="w-5 h-5 text-medical-600" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-medical-600" />
              <h2 className="text-lg font-semibold text-medical-900">
                {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd/MM', { locale: vi })} - {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: vi })}
              </h2>
            </div>
            <button onClick={handleNextWeek} className="p-2 rounded-full hover:bg-medical-100 transition-colors">
              <ChevronRight className="w-5 h-5 text-medical-600" />
            </button>

            <div className="flex items-center gap-1 bg-medical-100 rounded-lg p-1 ml-4">
              {['day', 'week', 'month'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-white text-medical-900 shadow-sm'
                      : 'text-medical-600 hover:text-medical-900'
                  }`}
                >
                  {mode === 'day' ? 'Ngày' : mode === 'week' ? 'Tuần' : 'Tháng'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medical-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-medical-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm w-full md:w-64"
              placeholder="Tìm kiếm lịch hẹn..."
            />
          </div>
        </div>

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={`rounded-lg border p-3 ${
                  isSameDay(day, new Date()) ? 'border-primary-500 bg-primary-50' : 'border-medical-200 bg-white'
                }`}
              >
                <div className="text-center mb-3">
                  <p className={`text-xs uppercase ${isSameDay(day, new Date()) ? 'text-primary-700 font-semibold' : 'text-medical-600'}`}>
                    {format(day, 'EEE', { locale: vi })}
                  </p>
                  <p className={`text-lg font-semibold ${isSameDay(day, new Date()) ? 'text-primary-900' : 'text-medical-900'}`}>
                    {format(day, 'd')}
                  </p>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {allAppointments // Lọc từ tất cả lịch hẹn để hiển thị trong calendar
                    .filter(apt => isSameDay(apt.date, day))
                    .map((apt) => (
                      <div
                        key={apt.id}
                        className={`p-2 rounded-lg border-l-2 cursor-pointer hover:opacity-80 transition-colors
                          ${apt.status === 'confirmed' ? 'bg-green-50 border-green-500' :
                           apt.status === 'pending' ? 'bg-yellow-50 border-yellow-500' :
                           apt.status === 'completed' ? 'bg-blue-50 border-blue-500' :
                           'bg-gray-50 border-gray-500'
                          }`}
                      >
                        <p className={`text-xs font-medium ${apt.status === 'confirmed' ? 'text-green-900' :
                           apt.status === 'pending' ? 'text-yellow-900' :
                           apt.status === 'completed' ? 'text-blue-900' :
                           'text-gray-900'
                          }`}>{apt.time}</p>
                        <p className={`text-xs truncate ${apt.status === 'confirmed' ? 'text-green-700' :
                           apt.status === 'pending' ? 'text-yellow-700' :
                           apt.status === 'completed' ? 'text-blue-700' :
                           'text-gray-700'
                          }`}>
                          {user?.role === 'patient' ? apt.doctor : apt.patient}
                        </p>
                        <p className={`text-xs ${apt.status === 'confirmed' ? 'text-green-600' :
                           apt.status === 'pending' ? 'text-yellow-600' :
                           apt.status === 'completed' ? 'text-blue-600' :
                           'text-gray-600'
                          }`}>{apt.type}</p>
                      </div>
                    ))}
                  {allAppointments.filter(apt => isSameDay(apt.date, day)).length === 0 && (
                    <p className="text-xs text-medical-400 text-center">Không có lịch</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointments List - Grouped by Status */}
      <div className="glass-effect rounded-2xl p-6 bg-white shadow-soft">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-medical-900">
            Danh sách lịch hẹn
          </h2>
          <div className="flex items-center gap-2">
            {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setCurrentFilterStatus(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border
                  ${currentFilterStatus === status
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-medical-700 border-medical-200 hover:bg-medical-50'
                  }`}
              >
                {status === 'all' ? 'Tất cả' : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Confirmed Appointments */}
        {confirmedAppointments.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Lịch hẹn đã xác nhận ({confirmedAppointments.length})
            </h3>
            <div className="space-y-4">
              {confirmedAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </div>
        )}

        {/* Pending Appointments */}
        {pendingAppointments.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-yellow-700 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Lịch hẹn chờ xác nhận ({pendingAppointments.length})
            </h3>
            <div className="space-y-4">
              {pendingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Appointments */}
        {completedAppointments.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Lịch hẹn đã hoàn thành ({completedAppointments.length})
            </h3>
            <div className="space-y-4">
              {completedAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </div>
        )}

        {/* Cancelled Appointments */}
        {cancelledAppointments.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Lịch hẹn đã hủy ({cancelledAppointments.length})
            </h3>
            <div className="space-y-4">
              {cancelledAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </div>
        )}

        {filteredAppointments.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-medical-300 mx-auto mb-4" />
            <p className="text-medical-600">
              {searchTerm || currentFilterStatus !== 'all' ? 'Không tìm thấy lịch hẹn nào' : 'Chưa có lịch hẹn nào'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;