import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Phone, 
  MapPin, 
  Award, 
  Users, 
  Clock,
  ArrowRight,
  Shield,
  Heart
} from 'lucide-react';

const HeroSection = ({ clinicStatus }) => {
  const navigate = useNavigate();

  const stats = [
    { icon: Users, label: 'Bệnh nhân tin tưởng', value: '50,000+' },
    { icon: Award, label: 'Năm kinh nghiệm', value: '15+' },
    { icon: Heart, label: 'Dịch vụ chuyên khoa', value: '25+' },
    { icon: Shield, label: 'Tỷ lệ hài lòng', value: '98%' },
  ];

  return (
    <section className="relative overflow-hidden gradient-bg">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium">
                <div className={`w-2 h-2 rounded-full ${clinicStatus === 'open' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{clinicStatus === 'open' ? 'Đang phục vụ' : 'Ngoài giờ làm việc'}</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Chăm sóc sức khỏe{' '}
                <span className="text-gradient">toàn diện</span>{' '}
                cho gia đình bạn
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Với đội ngũ bác sĩ giàu kinh nghiệm và trang thiết bị hiện đại, 
                chúng tôi cam kết mang đến dịch vụ y tế chất lượng cao, 
                an toàn và tin cậy cho mọi gia đình Việt Nam.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/appointment')}
                className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-4"
              >
                <Calendar className="w-6 h-6" />
                <span>Đặt lịch khám ngay</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => window.location.href = 'tel:+84123456789'}
                className="btn-secondary flex items-center justify-center space-x-2 text-lg px-8 py-4"
              >
                <Phone className="w-6 h-6" />
                <span>Gọi tư vấn miễn phí</span>
              </button>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-5 h-5 text-primary-600" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-5 h-5 text-primary-600" />
                <span>24/7 Cấp cứu</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-slide-up">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Modern medical facility"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-xl p-4 animate-pulse-slow">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">An toàn 100%</p>
                  <p className="text-sm text-gray-600">Tiêu chuẩn quốc tế</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4 animate-pulse-slow">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Chứng nhận</p>
                  <p className="text-sm text-gray-600">ISO 9001:2015</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 pt-12 border-t border-gray-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4 group-hover:bg-primary-200 transition-colors duration-200">
                  <stat.icon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;