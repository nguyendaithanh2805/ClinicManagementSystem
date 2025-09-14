import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Plus, Filter, Search, User, MapPin } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { vi } from 'date-fns/locale';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [searchTerm, setSearchTerm] = useState('');

  const appointments = [
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
      date: addDays(new Date(), 1),
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
      date: addDays(new Date(), 2),
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
    }
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

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = searchTerm === '' || 
      (apt.patient && apt.patient.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (apt.doctor && apt.doctor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      apt.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-effect rounded-2xl p-6">
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
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-medical-600" />
              <h2 className="text-lg font-semibold text-medical-900">
                {format(selectedDate, 'MMMM yyyy', { locale: vi })}
              </h2>
            </div>
            
            <div className="flex items-center gap-1 bg-medical-100 rounded-lg p-1">
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
              className="pl-10 pr-4 py-2 border border-medical-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              placeholder="Tìm kiếm lịch hẹn..."
            />
          </div>
        </div>

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="bg-white rounded-lg border border-medical-200 p-3">
                <div className="text-center mb-3">
                  <p className="text-xs text-medical-600 uppercase">
                    {format(day, 'EEE', { locale: vi })}
                  </p>
                  <p className="text-lg font-semibold text-medical-900">
                    {format(day, 'd')}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {filteredAppointments
                    .filter(apt => format(apt.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
                    .map((apt) => (
                      <div
                        key={apt.id}
                        className="p-2 bg-blue-50 rounded-lg border-l-2 border-blue-500 cursor-pointer hover:bg-blue-100 transition-colors"
                      >
                        <p className="text-xs font-medium text-blue-900">{apt.time}</p>
                        <p className="text-xs text-blue-700 truncate">
                          {user?.role === 'patient' ? apt.doctor : apt.patient}
                        </p>
                        <p className="text-xs text-blue-600">{apt.type}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointments List */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-medical-900">
            Danh sách lịch hẹn
          </h2>
          <div className="flex items-center gap-2 text-sm text-medical-600">
            <Clock className="w-4 h-4" />
            <span>{filteredAppointments.length} lịch hẹn</span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="border border-medical-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200">
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
                      {appointment.status !== 'completed' && (
                        <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                          Hủy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-medical-300 mx-auto mb-4" />
            <p className="text-medical-600">
              {searchTerm ? 'Không tìm thấy lịch hẹn nào' : 'Chưa có lịch hẹn nào'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;