import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  TestTube, 
  Activity,
  Shield,
  UserCheck,
  Stethoscope,
  ClipboardList,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { FaRegUserCircle } from "react-icons/fa";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Xây dựng menu động dựa trên role
  const getMenuItems = () => {
    switch (user?.role) {
      case 'Patient':
        return [
          { icon: Home, label: 'Trang chủ', path: '/patient/patient-dashboard' },
          { icon: Calendar, label: 'Lịch khám', path: '/patient/appointments' },
          { icon: FileText, label: 'Hồ sơ Bệnh án', path: '/patient/medical-records' },
          { icon: TestTube, label: 'Kết quả XN', path: '/patient/test-results' },
        ];
      
      case 'Doctor':
        return [
          { icon: Home, label: 'Trang chủ', path: '/staff/doctor-dashboard' },
          { icon: Calendar, label: 'Lịch làm việc', path: '/staff/schedule' },
          { icon: FileText, label: 'Hồ sơ Bệnh nhân', path: '/staff/patient-medical-records' },
        ];
      
      case 'Receptionist':
        return [
          { icon: Home, label: 'Trang chủ', path: '/staff/receptionist-dashboard' },
          { icon: Calendar, label: 'Lịch hẹn', path: '/staff/appointments' },
          { icon: Users, label: 'Bệnh nhân', path: '/staff/patients' },
          { icon: FileText, label: 'Hồ sơ Bệnh nhân', path: '/staff/medical-records' },
          { icon: FileText, label: 'Thanh toán', path: '/staff/payments' }
        ];
      
      case 'LabTechnician':
        return [
          { icon: Home, label: 'Trang chủ', path: '/staff/lab-dashboard' },
          { icon: TestTube, label: 'Hàng đợi XN', path: '/staff/test-queue' },
        ];
      
      case 'Admin':
        return [
          { icon: Home, label: 'Trang chủ', path: '/staff/admin-dashboard' },
          { icon: Users, label: 'Quản lý người dùng', path: '/admin/user-management' },
          { icon: Shield, label: 'Hệ thống', path: '/admin/system-management' },
          { icon: Activity, label: 'Hoạt động', path: '/admin/activity-logs' },
          { icon: BarChart3, label: 'Thống kê', path: '/admin/analytics' },
        ];
    }
  };

  const menuItems = getMenuItems();

  const isActive = (path) => {
    // Xử lý dashboard riêng
    if (path.endsWith('/dashboard')) {
      return location.pathname === path;
    }
    return location.pathname === path;
  };


  return (
    <div className={`glass-effect border-r border-white/20 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        {/* Collapse Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-medical-600 hover:text-medical-900 hover:bg-white/50 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
            <div className="flex items-center gap-3">
              <FaRegUserCircle className="w-8 h-8 text-gray-500" />
              <div>
                <p className="font-medium text-medical-900 text-sm">{user?.username}</p>
                <p className="text-xs text-medical-600">{user?.department}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'text-medical-700 hover:bg-white/50 hover:text-medical-900'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Quick Stats */}
        {!isCollapsed && (
          <div className="mt-8 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
            <h3 className="text-sm font-medium text-medical-900 mb-2">Hôm nay</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-medical-600">Hoạt động</span>
                <span className="font-medium text-green-600">24</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-medical-600">Hoàn thành</span>
                <span className="font-medium text-blue-600">18</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;