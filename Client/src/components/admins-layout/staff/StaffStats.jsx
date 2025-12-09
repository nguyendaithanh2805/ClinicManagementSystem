import React from 'react';
import { Users, Calendar, Clock, CheckCircle } from 'lucide-react';

const StaffStats = () => {
  const stats = [
    {
      icon: Users,
      label: 'Bệnh nhân hôm nay',
      value: '24',
      change: '+3 so với hôm qua',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Calendar,
      label: 'Lịch hẹn đã xác nhận',
      value: '18',
      change: '6 lịch chờ xác nhận',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Clock,
      label: 'Thời gian chờ trung bình',
      value: '15p',
      change: 'Giảm 5p so với hôm qua',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: CheckCircle,
      label: 'Hoàn thành',
      value: '12',
      change: '12 bệnh nhân còn lại',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
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

export default StaffStats;