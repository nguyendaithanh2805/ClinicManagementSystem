import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useNotifications } from './contexts/NotificationContext';
import { Heart, Bell, User, LogOut, Menu, X } from 'lucide-react';
import { FaRegUserCircle } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <nav className="glass-effect border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-medical-900">Phòng khám Đa khoa</h1>
              <p className="text-xs text-medical-600">Hệ thống quản lý</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-medical-600 hover:text-medical-900 transition-colors">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

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
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full px-4 py-2 text-left text-sm text-medical-700 hover:bg-white/50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Thông tin cá nhân
                  </button>
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
              <button className="w-full flex items-center gap-3 p-3 text-left text-medical-700 hover:bg-white/50 rounded-lg">
                <Bell className="w-5 h-5" />
                Thông báo
                {unreadCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 text-left text-medical-700 hover:bg-white/50 rounded-lg">
                <User className="w-5 h-5" />
                Thông tin cá nhân
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