import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Car, 
  Bus,
  Navigation,
  MessageCircle,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';

const ContactInfo = () => {
  const contactMethods = [
    {
      icon: Phone,
      title: 'Điện thoại',
      primary: '0123-456-789',
      secondary: 'Cấp cứu 24/7',
      action: () => window.location.href = 'tel:+84123456789',
      color: 'green'
    },
    {
      icon: Mail,
      title: 'Email',
      primary: 'info@medicare.vn',
      secondary: 'Phản hồi trong 24h',
      action: () => window.location.href = 'mailto:info@medicare.vn',
      color: 'blue'
    },
    {
      icon: MessageCircle,
      title: 'Chat trực tuyến',
      primary: 'Hỗ trợ 24/7',
      secondary: 'Phản hồi ngay lập tức',
      action: () => console.log('Open chat'),
      color: 'purple'
    },
    {
      icon: MapPin,
      title: 'Địa chỉ',
      primary: '123 Đường ABC, Quận 1',
      secondary: 'TP. Hồ Chí Minh',
      action: () => window.open('https://maps.google.com', '_blank'),
      color: 'red'
    }
  ];

  const operatingHours = [
    { day: 'Thứ 2 - Thứ 6', hours: '7:00 - 19:00' },
    { day: 'Thứ 7', hours: '7:00 - 17:00' },
    { day: 'Chủ nhật', hours: '8:00 - 17:00' },
    { day: 'Cấp cứu', hours: '24/7' }
  ];

  const transportOptions = [
    {
      icon: Car,
      title: 'Ô tô',
      description: 'Bãi đỗ xe miễn phí 200 chỗ',
      color: 'blue'
    },
    {
      icon: Bus,
      title: 'Xe buýt',
      description: 'Tuyến 01, 05, 19, 36',
      color: 'green'
    },
    {
      icon: Navigation,
      title: 'Taxi/Grab',
      description: 'Điểm đón trước cổng chính',
      color: 'orange'
    }
  ];

  const socialLinks = [
    { icon: Facebook, name: 'Facebook', url: '#', color: 'blue' },
    { icon: Instagram, name: 'Instagram', url: '#', color: 'pink' },
    { icon: Youtube, name: 'YouTube', url: '#', color: 'red' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-600 group-hover:bg-green-200',
      blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-200',
      purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-200',
      red: 'bg-red-100 text-red-600 group-hover:bg-red-200',
      orange: 'bg-orange-100 text-orange-600 group-hover:bg-orange-200',
      pink: 'bg-pink-100 text-pink-600 group-hover:bg-pink-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MapPin className="w-4 h-4" />
            <span>Thông tin liên hệ</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Liên hệ với <span className="text-gradient">chúng tôi</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy liên hệ qua bất kỳ kênh nào 
            thuận tiện nhất cho bạn
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Methods */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  onClick={method.action}
                  className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer card-hover group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClasses(method.color)} transition-colors duration-200`}>
                      <method.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors duration-200">
                        {method.title}
                      </h3>
                      <p className="text-gray-900 font-medium mb-1">{method.primary}</p>
                      <p className="text-sm text-gray-600">{method.secondary}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Vị trí phòng khám
                </h3>
                <p className="text-gray-600">
                  123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh
                </p>
              </div>
              <div className="h-64 bg-gray-200 relative">
                <img
                  src="https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Clinic location map"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary-600/20 flex items-center justify-center">
                  <button
                    onClick={() => window.open('https://maps.google.com', '_blank')}
                    className="bg-white text-primary-600 hover:bg-primary-50 font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <Navigation className="w-5 h-5" />
                    <span>Xem bản đồ chi tiết</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Operating Hours */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-bold text-gray-900">Giờ làm việc</h3>
              </div>
              <div className="space-y-3">
                {operatingHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-700 font-medium">{schedule.day}</span>
                    <span className={`font-semibold ${schedule.day === 'Cấp cứu' ? 'text-red-600' : 'text-gray-900'}`}>
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  🟢 Hiện tại: Đang mở cửa
                </p>
              </div>
            </div>

            {/* Transportation */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Phương tiện di chuyển
              </h3>
              <div className="space-y-4">
                {transportOptions.map((transport, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColorClasses(transport.color)}`}>
                      <transport.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{transport.title}</h4>
                      <p className="text-sm text-gray-600">{transport.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Theo dõi chúng tôi
              </h3>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(social.color)} transition-all duration-200 hover:scale-110`}
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Cập nhật thông tin y tế và các chương trình khuyến mãi mới nhất
              </p>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-2 mb-3">
                <Phone className="w-5 h-5" />
                <h3 className="text-lg font-bold">Cấp cứu 24/7</h3>
              </div>
              <p className="text-red-100 mb-4">
                Trong trường hợp khẩn cấp, hãy gọi ngay:
              </p>
              <button
                onClick={() => window.location.href = 'tel:+84123456789'}
                className="w-full bg-white text-red-600 hover:bg-red-50 font-bold py-3 px-4 rounded-lg transition-all duration-200 text-lg"
              >
                0123-456-789
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;