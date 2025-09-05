import React from 'react';
import { Activity, User, FileText, Settings, Shield, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const RecentActivities = () => {
  const activities = [
    {
      id: 1,
      type: 'user_login',
      user: 'BS. Trần Thị Bình',
      action: 'đã đăng nhập vào hệ thống',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      severity: 'info',
      details: 'IP: 192.168.1.100'
    },
    {
      id: 2,
      type: 'patient_created',
      user: 'Lễ tân Nguyễn Thị Dung',
      action: 'đã tạo hồ sơ bệnh nhân mới',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      severity: 'success',
      details: 'Bệnh nhân: Trần Văn B (BN012)'
    },
    {
      id: 3,
      type: 'system_backup',
      user: 'Hệ thống',
      action: 'đã hoàn thành backup tự động',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      severity: 'success',
      details: 'Dung lượng: 2.3GB'
    },
    {
      id: 4,
      type: 'user_created',
      user: 'Quản trị viên Hệ thống',
      action: 'đã tạo tài khoản nhân viên mới',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      severity: 'info',
      details: 'Y tá: Phạm Thị C (YT005)'
    },
    {
      id: 5,
      type: 'security_alert',
      user: 'Hệ thống bảo mật',
      action: 'phát hiện đăng nhập bất thường',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      severity: 'warning',
      details: 'IP: 203.162.4.191 (Đã chặn)'
    },
    {
      id: 6,
      type: 'data_export',
      user: 'BS. Lê Văn D',
      action: 'đã xuất báo cáo thống kê',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      severity: 'info',
      details: 'Báo cáo tháng 12/2024'
    },
    {
      id: 7,
      type: 'system_update',
      user: 'Quản trị viên Hệ thống',
      action: 'đã cập nhật cấu hình hệ thống',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      severity: 'info',
      details: 'Module: Quản lý lịch hẹn'
    },
    {
      id: 8,
      type: 'user_logout',
      user: 'Y tá Lê Thị Cẩm',
      action: 'đã đăng xuất khỏi hệ thống',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      severity: 'info',
      details: 'Thời gian làm việc: 8h 30m'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_login':
      case 'user_logout':
        return <User className="w-4 h-4" />;
      case 'patient_created':
      case 'user_created':
        return <FileText className="w-4 h-4" />;
      case 'system_backup':
      case 'system_update':
        return <Settings className="w-4 h-4" />;
      case 'security_alert':
        return <Shield className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-medical-900">Hoạt động gần đây</h2>
        <button className="btn-secondary text-sm">
          Xem tất cả
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-medical-200 hover:shadow-soft transition-all duration-200">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getSeverityColor(activity.severity)}`}>
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-medium text-medical-900">
                  <span className="font-semibold">{activity.user}</span> {activity.action}
                </p>
                <div className="flex items-center gap-1 text-xs text-medical-500">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: vi })}
                </div>
              </div>
              
              {activity.details && (
                <p className="text-xs text-medical-600 bg-medical-50 px-2 py-1 rounded">
                  {activity.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-medical-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-blue-600">
              {activities.filter(a => a.type.includes('user')).length}
            </p>
            <p className="text-xs text-medical-600">Người dùng</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">
              {activities.filter(a => a.type.includes('system')).length}
            </p>
            <p className="text-xs text-medical-600">Hệ thống</p>
          </div>
          <div>
            <p className="text-lg font-bold text-yellow-600">
              {activities.filter(a => a.severity === 'warning').length}
            </p>
            <p className="text-xs text-medical-600">Cảnh báo</p>
          </div>
          <div>
            <p className="text-lg font-bold text-purple-600">
              {activities.filter(a => a.type.includes('security')).length}
            </p>
            <p className="text-xs text-medical-600">Bảo mật</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;