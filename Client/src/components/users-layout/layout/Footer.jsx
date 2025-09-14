import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Heart,
  Shield,
  Award,
  Users
} from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'Trang Chủ', path: '/' },
    { name: 'Dịch Vụ', path: '/services' },
    { name: 'Bác Sĩ', path: '/doctors' },
    { name: 'Đặt Lịch', path: '/appointment' },
    { name: 'Về Chúng Tôi', path: '/about' },
    { name: 'Liên Hệ', path: '/contact' }
  ];

  const services = [
    { name: 'Khám Tổng Quát', path: '/services/general' },
    { name: 'Tim Mạch', path: '/services/cardiology' },
    { name: 'Nhi Khoa', path: '/services/pediatrics' },
    { name: 'Thần Kinh', path: '/services/neurology' },
    { name: 'Mắt', path: '/services/ophthalmology' },
    { name: 'Xương Khớp', path: '/services/orthopedics' }
  ];

  const policies = [
    { name: 'Chính Sách Bảo Mật', path: '/privacy' },
    { name: 'Điều Khoản Sử Dụng', path: '/terms' },
    { name: 'Chính Sách Hoàn Tiền', path: '/refund' },
    { name: 'Quy Định Khám Chữa Bệnh', path: '/regulations' }
  ];

  const socialLinks = [
    { icon: Facebook, name: 'Facebook', url: '#', color: 'hover:text-blue-500' },
    { icon: Instagram, name: 'Instagram', url: '#', color: 'hover:text-pink-500' },
    { icon: Youtube, name: 'YouTube', url: '#', color: 'hover:text-red-500' },
    { icon: Twitter, name: 'Twitter', url: '#', color: 'hover:text-blue-400' }
  ];

  const certifications = [
    { icon: Shield, text: 'ISO 9001:2015' },
    { icon: Award, text: 'Chứng nhận Bộ Y tế' },
    { icon: Heart, text: 'JCI Accredited' },
    { icon: Users, text: '50,000+ Bệnh nhân' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary-500 rounded-sm"></div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold">MediCare</h3>
                <p className="text-gray-400 text-sm">Phòng khám Đa khoa</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Chăm sóc sức khỏe toàn diện với đội ngũ bác sĩ giàu kinh nghiệm 
              và trang thiết bị y tế hiện đại nhất.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-300">123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-300">0123-456-789</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-300">info@medicare.vn</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-300">24/7 Cấp cứu</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Liên Kết Nhanh</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200 flex items-center space-x-2 group"
                  >
                    <span className="w-1 h-1 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6">Dịch Vụ Y Tế</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <Link
                    to={service.path}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-200 flex items-center space-x-2 group"
                  >
                    <span className="w-1 h-1 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                    <span>{service.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h4 className="text-lg font-bold mb-6">Kết Nối Với Chúng Tôi</h4>
            
            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                Đăng ký nhận thông tin y tế và khuyến mãi mới nhất
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400"
                />
                <button className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-r-lg transition-colors duration-200">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="mb-6">
              <p className="text-gray-300 mb-4">Theo dõi chúng tôi</p>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 ${social.color} transition-all duration-200 hover:scale-110`}
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <p className="text-gray-300 mb-4">Chứng nhận & Giải thưởng</p>
              <div className="grid grid-cols-2 gap-3">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs text-gray-400">
                    <cert.icon className="w-4 h-4 text-primary-400" />
                    <span>{cert.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 MediCare Clinic. Tất cả quyền được bảo lưu.
            </div>
            
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              {policies.map((policy, index) => (
                <Link
                  key={index}
                  to={policy.path}
                  className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                >
                  {policy.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="bg-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center space-x-4 text-white">
            <Phone className="w-5 h-5" />
            <span className="font-medium">Cấp cứu 24/7:</span>
            <a
              href="tel:+84123456789"
              className="font-bold text-lg hover:text-red-200 transition-colors duration-200"
            >
              0123-456-789
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;