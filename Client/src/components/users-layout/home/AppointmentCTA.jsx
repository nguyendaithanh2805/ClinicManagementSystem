import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  ArrowRight,
  CheckCircle,
  MapPin,
  Stethoscope
} from 'lucide-react';

const AppointmentCTA = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState('');

  const quickServices = [
    { id: 'general', name: 'Khám tổng quát', icon: Stethoscope },
    { id: 'cardiology', name: 'Tim mạch', icon: CheckCircle },
    { id: 'pediatrics', name: 'Nhi khoa', icon: User },
    { id: 'neurology', name: 'Thần kinh', icon: CheckCircle },
  ];

  const benefits = [
    'Đặt lịch online 24/7',
    'Xác nhận lịch hẹn ngay lập tức',
    'Nhắc nhở trước 24h',
    'Hỗ trợ đổi lịch miễn phí',
    'Tư vấn trước khám',
    'Báo cáo kết quả online'
  ];

  const handleQuickBooking = () => {
    if (selectedService) {
      navigate(`/appointment?service=${selectedService}`);
    } else {
      navigate('/appointment');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-blue-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                <Calendar className="w-4 h-4" />
                <span>Đặt lịch khám</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Đặt lịch khám{' '}
                <span className="text-yellow-300">dễ dàng</span>{' '}
                chỉ trong 2 phút
              </h2>
              
              <p className="text-xl text-blue-100 leading-relaxed">
                Hệ thống đặt lịch thông minh giúp bạn chọn bác sĩ, thời gian phù hợp 
                và nhận xác nhận ngay lập tức. Không cần chờ đợi, không cần gọi điện.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span className="text-blue-100">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-8 pt-6 border-t border-white/20">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">2 phút</p>
                <p className="text-sm text-blue-200">Thời gian đặt lịch</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-sm text-blue-200">Hỗ trợ online</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-sm text-blue-200">Xác nhận ngay</p>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Đặt lịch khám ngay
              </h3>
              <p className="text-gray-600">
                Chọn dịch vụ và thời gian phù hợp với bạn
              </p>
            </div>

            <div className="space-y-6">
              {/* Quick Service Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn dịch vụ khám
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {quickServices.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                        selectedService === service.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300 text-gray-700'
                      }`}
                    >
                      <service.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{service.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span>Thời gian khám: 30-45 phút</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <span>123 Đường ABC, Quận 1, TP.HCM</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-primary-500" />
                  <span>Hỗ trợ: 0123-456-789</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleQuickBooking}
                  className="w-full btn-primary flex items-center justify-center space-x-2 text-lg py-4"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Đặt lịch ngay</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => window.location.href = 'tel:+84123456789'}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200"
                >
                  <Phone className="w-5 h-5" />
                  <span>Gọi đặt lịch: 0123-456-789</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Bảo mật thông tin</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Miễn phí đổi lịch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppointmentCTA;