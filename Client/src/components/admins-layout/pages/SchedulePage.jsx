import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Users, Plus, Filter, ChevronLeft, ChevronRight, MapPin, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { vi } from 'date-fns/locale';

const SchedulePage = () => {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');

  const scheduleData = [
    {
      id: 'sch001',
      date: new Date(),
      time: '08:00',
      duration: 30,
      patient: 'Nguyễn Văn An',
      patientId: 'BN001',
      type: 'Khám định kỳ',
      room: 'Phòng 201',
      status: 'confirmed',
      priority: 'normal',
      phone: '0901234567',
      notes: 'Kiểm tra huyết áp, theo dõi tiểu đường',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'sch002',
      date: new Date(),
      time: '08:30',
      duration: 45,
      patient: 'Trần Thị Mai',
      patientId: 'BN002',
      type: 'Tái khám',
      room: 'Phòng 201',
      status: 'confirmed',
      priority: 'normal',
      phone: '0912345678',
      notes: 'Theo dõi sau điều trị viêm dạ dày',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'sch003',
      date: new Date(),
      time: '09:30',
      duration: 60,
      patient: 'Lê Minh Tuấn',
      patientId: 'BN003',
      type: 'Khám chuyên khoa',
      room: 'Phòng 201',
      status: 'pending',
      priority: 'high',
      phone: '0923456789',
      notes: 'Khám tim mạch, có triệu chứng đau ngực',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'sch004',
      date: addDays(new Date(), 1),
      time: '10:00',
      duration: 30,
      patient: 'Phạm Thị Hoa',
      patientId: 'BN004',
      type: 'Khám sức khỏe',
      room: 'Phòng 201',
      status: 'confirmed',
      priority: 'normal',
      phone: '0934567890',
      notes: 'Khám sức khỏe định kỳ',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'sch005',
      date: addDays(new Date(), 1),
      time: '14:00',
      duration: 45,
      patient: 'Võ Minh Tuấn',
      patientId: 'BN005',
      type: 'Tư vấn',
      room: 'Phòng 201',
      status: 'pending',
      priority: 'normal',
      phone: '0945678901',
      notes: 'Tư vấn về chế độ dinh dưỡng',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'sch006',
      date: addDays(new Date(), 2),
      time: '09:00',
      duration: 30,
      patient: 'Đặng Thị Lan',
      patientId: 'BN006',
      type: 'Khám định kỳ',
      room: 'Phòng 201',
      status: 'confirmed',
      priority: 'normal',
      phone: '0956789012',
      notes: 'Kiểm tra kết quả xét nghiệm',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const workingHours = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'normal':
        return 'text-blue-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 1 }),
    end: endOfWeek(currentWeek, { weekStartsOn: 1 })
  });

  const getAppointmentsForDate = (date) => {
    return scheduleData.filter(appointment => 
      isSameDay(appointment.date, date)
    ).sort((a, b) => a.time.localeCompare(b.time));
  };

  const getAppointmentsForTime = (date, time) => {
    return scheduleData.filter(appointment => 
      isSameDay(appointment.date, date) && appointment.time === time
    );
  };

  const getTotalAppointments = () => {
    return scheduleData.filter(appointment => 
      weekDays.some(day => isSameDay(appointment.date, day))
    ).length;
  };

  const getConfirmedAppointments = () => {
    return scheduleData.filter(appointment => 
      weekDays.some(day => isSameDay(appointment.date, day)) && 
      appointment.status === 'confirmed'
    ).length;
  };

  const getPendingAppointments = () => {
    return scheduleData.filter(appointment => 
      weekDays.some(day => isSameDay(appointment.date, day)) && 
      appointment.status === 'pending'
    ).length;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-medical-900 mb-2">
              Lịch làm việc
            </h1>
            <p className="text-medical-600">
              Quản lý lịch hẹn và thời gian làm việc của bạn
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="btn-secondary inline-flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Bộ lọc
            </button>
            <button className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Thêm lịch hẹn
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-medical-900">{getTotalAppointments()}</p>
              <p className="text-sm text-medical-600">Tổng lịch hẹn tuần</p>
            </div>
          </div>
        </div>
        
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-medical-900">{getConfirmedAppointments()}</p>
              <p className="text-sm text-medical-600">Đã xác nhận</p>
            </div>
          </div>
        </div>
        
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-medical-900">{getPendingAppointments()}</p>
              <p className="text-sm text-medical-600">Chờ xác nhận</p>
            </div>
          </div>
        </div>
        
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-medical-900">
                {getAppointmentsForDate(new Date()).length}
              </p>
              <p className="text-sm text-medical-600">Hôm nay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <h2 className="text-lg font-semibold text-medical-900">
                  {format(weekDays[0], 'dd/MM', { locale: vi })} - {format(weekDays[6], 'dd/MM/yyyy', { locale: vi })}
                </h2>
                <p className="text-sm text-medical-600">
                  Tuần {format(currentWeek, 'w', { locale: vi })} năm {format(currentWeek, 'yyyy')}
                </p>
              </div>
              
              <button
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={() => setCurrentWeek(new Date())}
              className="btn-secondary text-sm"
            >
              Hôm nay
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-medical-100 rounded-lg p-1">
              {['week', 'day'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-white text-medical-900 shadow-sm'
                      : 'text-medical-600 hover:text-medical-900'
                  }`}
                >
                  {mode === 'week' ? 'Tuần' : 'Ngày'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header */}
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className="p-3 text-center font-medium text-medical-700">Giờ</div>
                {weekDays.map((day) => (
                  <div key={day.toISOString()} className="p-3 text-center">
                    <p className="text-sm text-medical-600 uppercase">
                      {format(day, 'EEE', { locale: vi })}
                    </p>
                    <p className={`text-lg font-semibold ${
                      isSameDay(day, new Date()) ? 'text-blue-600' : 'text-medical-900'
                    }`}>
                      {format(day, 'd')}
                    </p>
                    <p className="text-xs text-medical-500">
                      {getAppointmentsForDate(day).length} lịch hẹn
                    </p>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                {workingHours.map((time) => (
                  <div key={time} className="grid grid-cols-8 gap-2">
                    <div className="p-3 text-center text-sm font-medium text-medical-600 bg-medical-50 rounded-lg">
                      {time}
                    </div>
                    {weekDays.map((day) => {
                      const appointments = getAppointmentsForTime(day, time);
                      return (
                        <div key={`${day.toISOString()}-${time}`} className="min-h-[60px] bg-white border border-medical-200 rounded-lg p-2">
                          {appointments.map((appointment) => (
                            <div
                              key={appointment.id}
                              className={`p-2 rounded-lg text-xs cursor-pointer hover:shadow-sm transition-all duration-200 ${
                                appointment.status === 'confirmed' ? 'bg-blue-100 border-l-2 border-blue-500' :
                                appointment.status === 'pending' ? 'bg-yellow-100 border-l-2 border-yellow-500' :
                                'bg-gray-100 border-l-2 border-gray-500'
                              }`}
                            >
                              <p className="font-medium text-medical-900 truncate">
                                {appointment.patient}
                              </p>
                              <p className="text-medical-600 truncate">
                                {appointment.type}
                              </p>
                              <p className="text-medical-500">
                                {appointment.duration}p
                              </p>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-medical-900">
                  {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
                </h3>
                <p className="text-sm text-medical-600">
                  {getAppointmentsForDate(selectedDate).length} lịch hẹn
                </p>
              </div>
              
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {getAppointmentsForDate(selectedDate).map((appointment) => (
                <div key={appointment.id} className="bg-white border border-medical-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-medical-900">
                        {appointment.time}
                      </span>
                      <span className="text-xs text-medical-500">
                        {appointment.duration}p
                      </span>
                    </div>

                    <img
                      src={appointment.avatar}
                      alt={appointment.patient}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-medical-900 mb-1">
                            {appointment.patient}
                          </h4>
                          <p className="text-sm text-medical-600 mb-1">
                            {appointment.patientId} • {appointment.type}
                          </p>
                          <p className="text-sm text-medical-500">
                            {appointment.notes}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                          <AlertCircle className={`w-4 h-4 ${getPriorityColor(appointment.priority)}`} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-medical-600">
                          <MapPin className="w-4 h-4" />
                          <span>{appointment.room}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-medical-600">
                          <Phone className="w-4 h-4" />
                          <span>{appointment.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-medical-600">
                          <User className="w-4 h-4" />
                          <span>{appointment.patientId}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-medical-100">
                        <div className="flex gap-2">
                          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            Xem hồ sơ
                          </button>
                          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            Gọi điện
                          </button>
                        </div>
                        <div className="flex gap-2">
                          {appointment.status === 'pending' && (
                            <button className="btn-primary text-sm py-2 px-4">
                              Xác nhận
                            </button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                              Bắt đầu khám
                            </button>
                          )}
                          <button className="btn-secondary text-sm py-2 px-4">
                            Chỉnh sửa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {getAppointmentsForDate(selectedDate).length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-medical-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-medical-900 mb-2">
                    Không có lịch hẹn
                  </h3>
                  <p className="text-medical-600">
                    Bạn không có lịch hẹn nào trong ngày này
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;