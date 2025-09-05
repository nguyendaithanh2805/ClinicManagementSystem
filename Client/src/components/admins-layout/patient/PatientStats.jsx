import React from 'react';
import { Calendar, FileText, Pill, Heart } from 'lucide-react';

const PatientStats = () => {
  const stats = [
    {
      icon: Calendar,
      label: 'Lịch khám tháng này',
      value: '3',
      change: '+1 so với tháng trước',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: FileText,
      label: 'Hồ sơ y tế',
      value: '12',
      change: 'Cập nhật 2 ngày trước',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Pill,
      label: 'Đơn thuốc hiện tại',
      value: '2',
      change: 'Còn 5 ngày',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Heart,
      label: 'Chỉ số sức khỏe',
      value: 'Tốt',
      change: 'Kiểm tra gần nhất',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="glass-effect rounded-xl p-6 card-hover">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-medical-900 mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-medical-700 mb-1">{stat.label}</p>
              <p className="text-xs text-medical-500">{stat.change}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientStats;