import React from 'react';
import { Calendar, Clock, User, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const UpcomingAppointments = () => {
  const appointments = [
    {
      id: 'apt001',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      time: '14:30',
      doctor: 'BS. Trần Thị Bình',
      department: 'Nội khoa - Tim mạch',
      room: 'Phòng 201',
      status: 'confirmed',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      phone: '0912345678'
    },
    {
      id: 'apt002',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '09:00',
      doctor: 'BS. Nguyễn Văn Cường',
      department: 'Ngoại khoa',
      room: 'Phòng 105',
      status: 'pending',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      phone: '0923456789'
    },
    {
      id: 'apt003',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '16:00',
      doctor: 'BS. Lê Thị Hoa',
      department: 'Da liễu',
      room: 'Phòng 301',
      status: 'confirmed',
      avatar: 'https://images.unsplash.com/photo-1594824475317-d3b9b4b8b0b0?w=150&h=150&fit=crop&crop=face',
      phone: '0934567890'
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
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-medical-900">Lịch khám sắp tới</h2>
        <button className="btn-secondary text-sm">
          Xem tất cả
        </button>
      </div>

      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="border border-medical-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200">
            <div className="flex items-start gap-4">
              <img
                src={appointment.avatar}
                alt={appointment.doctor}
                className="w-12 h-12 rounded-xl object-cover"
              />
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-medical-900 mb-1">
                      {appointment.doctor}
                    </h3>
                    <p className="text-sm text-medical-600">
                      {appointment.department}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div className="flex items-center gap-2 text-sm text-medical-600">
                    <Calendar className="w-4 h-4" />
                    <span>{format(appointment.date, 'dd/MM/yyyy', { locale: vi })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-medical-600">
                    <Clock className="w-4 h-4" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-medical-600">
                    <MapPin className="w-4 h-4" />
                    <span>{appointment.room}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-medical-100">
                  <div className="flex items-center gap-2 text-sm text-medical-600">
                    <Phone className="w-4 h-4" />
                    <span>{appointment.phone}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-sm py-2 px-4">
                      Liên hệ
                    </button>
                    <button className="btn-primary text-sm py-2 px-4">
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingAppointments;