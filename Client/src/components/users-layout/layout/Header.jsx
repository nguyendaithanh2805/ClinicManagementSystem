import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Menu, 
  X, 
  Phone, 
  Clock, 
  MapPin,
  User,
  UserCheck,
  Calendar
} from 'lucide-react';

const Header = ({ onSearchOpen, clinicStatus, currentLanguage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Trang Chủ', path: '/', icon: null },
    { name: 'Dịch Vụ', path: '/services', icon: null },
    { name: 'Bác Sĩ', path: '/doctors', icon: null },
    { name: 'Về Chúng Tôi', path: '/about', icon: null },
    { name: 'Liên Hệ', path: '/contact', icon: null },
  ];

  const handleEmergencyCall = () => {
    window.location.href = 'tel:+84123456789';
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary-800 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Thứ 2-6: 7:00-19:00 | Thứ 7: 7:00-17:00 | CN: 8:00-17:00</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${clinicStatus === 'open' ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="font-medium">
                {clinicStatus === 'open' ? 'Đang Mở Cửa' : 'Đã Đóng Cửa'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleEmergencyCall}
              className="flex items-center space-x-2 hover:text-primary-200 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">Cấp Cứu: 0123-456-789</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary-500 rounded-sm"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MediCare</h1>
                <p className="text-sm text-gray-600">Phòng khám Đa khoa</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button
                onClick={onSearchOpen}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                aria-label="Tìm kiếm"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Patient Portal */}
              <button
                onClick={() => navigate('/patient-portal')}
                className="hidden sm:flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                <User className="w-5 h-5" />
                <span>Bệnh Nhân</span>
              </button>

              {/* Staff Portal */}
              <button
                onClick={() => navigate('/staff-portal')}
                className="hidden sm:flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                <UserCheck className="w-5 h-5" />
                <span>Nhân Viên</span>
              </button>

              {/* Appointment Button */}
              <button
                onClick={() => navigate('/appointment')}
                className="btn-primary flex items-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Đặt Lịch</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block text-gray-700 hover:text-primary-600 font-medium py-2 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={() => {
                    navigate('/patient-portal');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium w-full py-2"
                >
                  <User className="w-5 h-5" />
                  <span>Cổng Bệnh Nhân</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/staff-portal');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium w-full py-2"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>Cổng Nhân Viên</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;