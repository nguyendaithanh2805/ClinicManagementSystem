import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Settings, Users, Clock } from 'lucide-react';

const AdminHeader = () => {
  const { user } = useAuth();

  const getCurrentTime = () => {
    return new Date().toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-soft">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-medical-900 mb-1">
              Chào mừng, {user?.username}
            </h1>
            <p className="text-medical-600">
              Mã nhân viên: <span className="font-medium">{user?.staffId}</span>
            </p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:ml-6">
          <div className="flex items-center gap-2 text-sm text-medical-600">
            <Settings className="w-4 h-4" />
            <span>{user?.department}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-medical-600">
            <Clock className="w-4 h-4" />
            <span>{getCurrentTime()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-medical-600">
            <Users className="w-4 h-4" />
            <span>Toàn quyền hệ thống</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">Hệ thống hoạt động</span>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;