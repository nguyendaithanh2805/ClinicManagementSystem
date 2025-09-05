import React from 'react';
import { Users, Activity, Database, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const AdminStats = () => {
  const stats = [
    {
      icon: Users,
      label: 'Tổng người dùng',
      value: '1,247',
      change: '+12% so với tháng trước',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: 'up'
    },
    {
      icon: Activity,
      label: 'Hoạt động hôm nay',
      value: '89',
      change: 'Đang trực tuyến: 23',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: 'up'
    },
    {
      icon: Database,
      label: 'Dung lượng hệ thống',
      value: '67%',
      change: '2.3GB còn trống',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: 'stable'
    },
    {
      icon: TrendingUp,
      label: 'Hiệu suất',
      value: '94.2%',
      change: 'Thời gian phản hồi: 120ms',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: 'up'
    },
    {
      icon: AlertTriangle,
      label: 'Cảnh báo',
      value: '3',
      change: '1 cảnh báo quan trọng',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      trend: 'warning'
    },
    {
      icon: CheckCircle,
      label: 'Backup gần nhất',
      value: '2h',
      change: 'Tự động hàng ngày',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      trend: 'up'
    }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default:
        return <CheckCircle className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="glass-effect rounded-xl p-6 card-hover">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-2xl font-bold text-medical-900">{stat.value}</p>
                {getTrendIcon(stat.trend)}
              </div>
              <p className="text-sm font-medium text-medical-700 mb-1">{stat.label}</p>
              <p className="text-xs text-medical-500">{stat.change}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;