import React from 'react';
import { Server, Cpu, HardDrive, Wifi, Shield, Clock } from 'lucide-react';

const SystemOverview = () => {
  const systemMetrics = [
    {
      name: 'CPU Usage',
      value: 45,
      status: 'good',
      icon: Cpu,
      details: '2.4 GHz, 4 cores'
    },
    {
      name: 'Memory',
      value: 67,
      status: 'warning',
      icon: HardDrive,
      details: '6.7GB / 10GB'
    },
    {
      name: 'Storage',
      value: 34,
      status: 'good',
      icon: Server,
      details: '340GB / 1TB'
    },
    {
      name: 'Network',
      value: 89,
      status: 'excellent',
      icon: Wifi,
      details: '89 Mbps'
    }
  ];

  const recentEvents = [
    {
      id: 1,
      type: 'security',
      message: 'Đăng nhập thành công từ IP 192.168.1.100',
      time: '2 phút trước',
      severity: 'info'
    },
    {
      id: 2,
      type: 'system',
      message: 'Backup tự động hoàn thành',
      time: '1 giờ trước',
      severity: 'success'
    },
    {
      id: 3,
      type: 'warning',
      message: 'Dung lượng ổ đĩa đạt 67%',
      time: '3 giờ trước',
      severity: 'warning'
    },
    {
      id: 4,
      type: 'user',
      message: 'Tạo tài khoản mới: BS. Nguyễn Văn A',
      time: '5 giờ trước',
      severity: 'info'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getSeverityIcon = (type) => {
    switch (type) {
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'system':
        return <Server className="w-4 h-4" />;
      case 'warning':
        return <Clock className="w-4 h-4" />;
      default:
        return <Cpu className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Metrics */}
      <div className="glass-effect rounded-2xl p-6">
        <h2 className="text-xl font-bold text-medical-900 mb-6">Tình trạng hệ thống</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {systemMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl p-4 border border-medical-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-medical-100 rounded-lg flex items-center justify-center">
                    <metric.icon className="w-5 h-5 text-medical-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-medical-900">{metric.name}</h3>
                    <p className="text-sm text-medical-600">{metric.details}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-medical-900">{metric.value}%</span>
              </div>
              
              <div className="w-full bg-medical-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getStatusColor(metric.status)}`}
                  style={{ width: `${metric.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent System Events */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-medical-900">Sự kiện gần đây</h2>
          <button className="btn-secondary text-sm">
            Xem tất cả
          </button>
        </div>

        <div className="space-y-3">
          {recentEvents.map((event) => (
            <div key={event.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-medical-200">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getSeverityColor(event.severity)}`}>
                {getSeverityIcon(event.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-medical-900 mb-1">
                  {event.message}
                </p>
                <p className="text-xs text-medical-500">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;