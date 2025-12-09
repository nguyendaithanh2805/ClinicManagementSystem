import React from 'react';
import { Server, Database, Wifi, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const SystemHealth = () => {
  const healthChecks = [
    {
      name: 'Database',
      status: 'healthy',
      responseTime: '12ms',
      lastCheck: '1 phút trước',
      icon: Database,
      details: 'PostgreSQL 14.2'
    },
    {
      name: 'API Server',
      status: 'healthy',
      responseTime: '45ms',
      lastCheck: '1 phút trước',
      icon: Server,
      details: 'Node.js 18.17.0'
    },
    {
      name: 'Network',
      status: 'warning',
      responseTime: '156ms',
      lastCheck: '2 phút trước',
      icon: Wifi,
      details: 'Độ trễ cao'
    },
    {
      name: 'Security',
      status: 'healthy',
      responseTime: '8ms',
      lastCheck: '30 giây trước',
      icon: Shield,
      details: 'SSL Certificate OK'
    }
  ];

  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      message: 'Dung lượng ổ đĩa đạt 67%',
      time: '3 giờ trước',
      action: 'Cần dọn dẹp log files'
    },
    {
      id: 2,
      type: 'info',
      message: 'Backup tự động hoàn thành',
      time: '1 giờ trước',
      action: 'Đã lưu trữ 2.3GB dữ liệu'
    },
    {
      id: 3,
      type: 'success',
      message: 'Cập nhật bảo mật thành công',
      time: '6 giờ trước',
      action: 'Hệ thống đã được cập nhật'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health Status */}
      <div className="glass-effect rounded-2xl p-6">
        <h2 className="text-lg font-bold text-medical-900 mb-6">Tình trạng hệ thống</h2>
        
        <div className="space-y-4">
          {healthChecks.map((check, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-medical-200">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(check.status)}`}>
                <check.icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-medical-900 text-sm">{check.name}</p>
                  {getStatusIcon(check.status)}
                </div>
                <p className="text-xs text-medical-600 mb-1">{check.details}</p>
                <div className="flex items-center gap-3 text-xs text-medical-500">
                  <span>Phản hồi: {check.responseTime}</span>
                  <span>•</span>
                  <span>{check.lastCheck}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-medical-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-medical-600">Tổng quan hệ thống</span>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Hoạt động bình thường</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-medical-900">Cảnh báo hệ thống</h2>
          <button className="btn-secondary text-sm">
            Xem tất cả
          </button>
        </div>

        <div className="space-y-3">
          {systemAlerts.map((alert) => (
            <div key={alert.id} className={`border-l-4 pl-4 py-3 rounded-r-lg ${getAlertColor(alert.type)}`}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-medical-900">
                  {alert.message}
                </p>
                <span className="text-xs text-medical-500">{alert.time}</span>
              </div>
              <p className="text-xs text-medical-600">{alert.action}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-medical-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-green-600">
                {systemAlerts.filter(a => a.type === 'success').length}
              </p>
              <p className="text-xs text-medical-600">Thành công</p>
            </div>
            <div>
              <p className="text-lg font-bold text-yellow-600">
                {systemAlerts.filter(a => a.type === 'warning').length}
              </p>
              <p className="text-xs text-medical-600">Cảnh báo</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-600">
                {systemAlerts.filter(a => a.type === 'error').length}
              </p>
              <p className="text-xs text-medical-600">Lỗi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;