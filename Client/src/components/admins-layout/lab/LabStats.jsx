import React from 'react';
import { TestTube, Clock, CheckCircle, AlertTriangle, TrendingUp, Users } from 'lucide-react';

const LabStats = () => {
  const stats = [
    {
      icon: TestTube,
      label: 'Mẫu xét nghiệm hôm nay',
      value: '47',
      change: '+8 so với hôm qua',
      color: 'text-teal-600',
      bgColor: 'bg-teal-100'
    },
    {
      icon: Clock,
      label: 'Thời gian xử lý TB',
      value: '2.5h',
      change: 'Giảm 30p so với hôm qua',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: CheckCircle,
      label: 'Hoàn thành',
      value: '32',
      change: '15 mẫu đang xử lý',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: AlertTriangle,
      label: 'Cần xem lại',
      value: '3',
      change: '2 mẫu bất thường',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: TrendingUp,
      label: 'Hiệu suất',
      value: '94%',
      change: 'Tăng 2% tuần này',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Users,
      label: 'Bệnh nhân chờ KQ',
      value: '12',
      change: 'Sẽ có KQ trong 1h',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

export default LabStats;