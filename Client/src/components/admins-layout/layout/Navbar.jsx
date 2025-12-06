import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Heart, Bell, User, LogOut, Menu, X, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FaRegUserCircle } from "react-icons/fa";
import { formatDbUtcToVnTime } from '../../../utils/dateFormatter';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount, isDropdownOpen, toggleDropdown, notifications, markAsRead } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  return (
    <nav className="bg-[#ecfeff]/90 glass-effect border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-medical-900">Phòng khám Đa khoa</h1>
              <p className="text-xs text-medical-600">Hệ thống quản lý</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
              <div className="relative">
                <button 
                  onClick={toggleDropdown} 
                  className="relative p-2 text-medical-600 hover:text-medical-900 transition-colors rounded-lg hover:bg-white/50"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                  )}
                </button>
                {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 max-h-[500px] bg-white rounded-xl shadow-2xl py-2 flex flex-col z-[51]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-gray-100">
                        <h4 className="text-lg font-bold text-medical-900">Thông báo</h4>
                    </div>

                    {/* Danh sách Thông báo */}
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => markAsRead(notification.id)}
                                className={`p-4 cursor-pointer transition-colors flex justify-between items-start gap-4 ${
                                    !notification.isRead ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50' 
                                }`}
                            >
                                {/* Nội dung thông báo */}
                                <div className="flex items-start gap-3 flex-1">
                                    <Bell 
                                        // Màu icon đậm hơn nếu chưa đọc
                                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                            !notification.isRead ? 'text-blue-700' : 'text-gray-500'
                                        }`} 
                                    />
                                    <div className="flex-1 min-w-0">
                                        {/* Tiêu đề */}
                                        <h5 className={`font-semibold text-sm ${
                                            !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                                        }`}>
                                            {notification.title}
                                        </h5>
                                        {/* Nội dung tin nhắn */}
                                        <p className={`text-sm mt-0.5 whitespace-normal ${
                                            !notification.isRead ? 'text-gray-700 font-medium' : 'text-gray-500'
                                        }`}>
                                            {notification.message}
                                        </p>
                                        {/* Thời gian */}
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDbUtcToVnTime(notification.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* CHẤM TRÒN CHƯA ĐỌC */}
                                {!notification.isRead && (
                                    <span 
                                        className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 mt-2" 
                                        aria-label="Thông báo chưa đọc"
                                    ></span>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-medical-500">
                            Không có thông báo nào.
                        </div>
                    )}
                </div>
                </div>
                )}
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 transition-colors"
              >
                <FaRegUserCircle className="w-8 h-8 text-gray-500" />
                <div className="text-left">
                  <p className="text-sm font-medium text-medical-900">{user?.username}</p>
                  <p className="text-xs text-medical-600 capitalize">{user?.role}</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 glass-effect rounded-xl shadow-lg py-2">
                  <div
                    className="w-full px-4 py-2 text-left text-sm text-medical-700 hover:bg-white/50 flex items-center gap-2"
                  >
                  <User className="w-4 h-4"/>
                    <Link to="/patient/my-account">Thông tin cá nhân</Link>
                  </div>
                  <div className="w-full px-4 py-2 text-left text-sm text-medical-700 hover:bg-white/50 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Cài đặt
                  </div>
                  <hr className="my-2 border-medical-200" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-medical-600 hover:text-medical-900"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-white/20 py-4">
            <div className="flex items-center gap-3 mb-4">
              <FaRegUserCircle className="w-8 h-8 text-gray-500" />
              <div>
                <p className="font-medium text-medical-900">{user?.username}</p>
                <p className="text-sm text-medical-600 capitalize">{user?.role}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Link
                to="/profile"
                className="w-full flex items-center gap-3 p-3 text-left text-medical-700 hover:bg-white/50 rounded-lg"
              >
                <User className="w-5 h-5" />
                Thông tin cá nhân
              </Link>
              
              <Link
                to="/settings"
                className="w-full flex items-center gap-3 p-3 text-left text-medical-700 hover:bg-white/50 rounded-lg"
              >
                <Settings className="w-5 h-5" />
                Cài đặt
              </Link>
              
              <button className="w-full flex items-center gap-3 p-3 text-left text-medical-700 hover:bg-white/50 rounded-lg">
                <Bell className="w-5 h-5" />
                Thông báo
                {unreadCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 text-left text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;