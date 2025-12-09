import React from 'react';
import { Calendar, Clock, User, MapPin, Phone, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const TodaySchedule = () => {
  const schedule = [
    {
      id: 'sch001',
      time: '08:00',
      patient: 'Nguyễn Thị Mai',
      patientId: 'BN001',
      type: 'Khám định kỳ',
      room: 'Phòng 201',
      status: 'completed',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      phone: '0901234567',
      notes: 'Kiểm tra huyết áp'
    },
    {
      id: 'sch002',
      time: '08:30',
      patient: 'Trần Văn Hùng',
      patientId: 'BN002',
      type: 'Tái khám',
      room: 'Phòng 201',
      status: 'in_progress',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      phone: '0912345678',
      notes: 'Theo dõi sau phẫu thuật'
    },
    {
      id: 'sch003',
      time: '09:00',
      patient: 'Lê Thị Hoa',
      patientId: 'BN003',
      type: 'Khám mới',
      room: 'Phòng 201',
      status: 'waiting',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      phone: '0923456789',
      notes: 'Đau ngực, khó thở'
    },
    {
      id: 'sch004',
      time: '09:30',
      patient: 'Phạm Minh Tuấn',
      patientId: 'BN004',
      type: 'Khám định kỳ',
      room: 'Phòng 201',
      status: 'scheduled',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      phone: '0934567890',
      notes: 'Kiểm tra tiểu đường'
    },
    {
      id: 'sch005',
      time: '10:00',
      patient: 'Võ Thị Lan',
      patientId: 'BN005',
      type: 'Tư vấn',
      room: 'Phòng 201',
      status: 'scheduled',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      phone: '0945678901',
      notes: 'Tư vấn dinh dưỡng'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'scheduled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'in_progress':
        return 'Đang khám';
      case 'waiting':
        return 'Đang chờ';
      case 'scheduled':
        return 'Đã lên lịch';
      default:
        return 'Không xác định';
    }
  };

  const getStatusAction = (status) => {
    switch (status) {
      case 'scheduled':
        return { text: 'Bắt đầu khám', color: 'btn-primary' };
      case 'waiting':
        return { text: 'Gọi vào', color: 'btn-primary' };
      case 'in_progress':
        return { text: 'Hoàn thành', color: 'bg-green-600 hover:bg-green-700 text-white' };
      case 'completed':
        return { text: 'Xem chi tiết', color: 'btn-secondary' };
      default:
        return { text: 'Xem', color: 'btn-secondary' };
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-medical-900">Lịch làm việc hôm nay</h2>
        <div className="flex items-center gap-2 text-sm text-medical-600">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(), 'dd/MM/yyyy', { locale: vi })}</span>
        </div>
      </div>

      <div className="space-y-4">
        {schedule.map((appointment) => (
          <div key={appointment.id} className="border border-medical-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-medical-900">
                  {appointment.time}
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
                    <h3 className="font-semibold text-medical-900 mb-1">
                      {appointment.patient}
                    </h3>
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
                    <button className="p-1 text-medical-400 hover:text-medical-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="flex items-center gap-2 text-sm text-medical-600">
                    <MapPin className="w-4 h-4" />
                    <span>{appointment.room}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-medical-600">
                    <Phone className="w-4 h-4" />
                    <span>{appointment.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-medical-100">
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Xem hồ sơ
                  </button>
                  <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getStatusAction(appointment.status).color}`}>
                    {getStatusAction(appointment.status).text}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaySchedule;