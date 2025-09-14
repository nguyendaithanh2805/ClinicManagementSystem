import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ArrowRight, 
  Clock, 
  User,
  Tag,
  TrendingUp,
  Heart,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const NewsAndUpdates = () => {
  const navigate = useNavigate();

  const news = [
    {
      id: 1,
      title: 'Khai trương phòng khám tim mạch với công nghệ AI tiên tiến',
      excerpt: 'Phòng khám MediCare chính thức đưa vào hoạt động hệ thống chẩn đoán tim mạch sử dụng trí tuệ nhân tạo, giúp phát hiện sớm các bệnh lý tim mạch với độ chính xác cao.',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      category: 'Công nghệ',
      date: new Date('2024-01-15'),
      author: 'BS. Nguyễn Văn An',
      readTime: '5 phút',
      featured: true,
      tags: ['Tim mạch', 'AI', 'Công nghệ']
    },
    {
      id: 2,
      title: 'Chương trình khám sức khỏe miễn phí cho trẻ em dưới 5 tuổi',
      excerpt: 'Trong tháng 2, phòng khám tổ chức chương trình khám sức khỏe và tiêm chủng miễn phí cho trẻ em dưới 5 tuổi tại các khu vực có hoàn cảnh khó khăn.',
      image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      category: 'Cộng đồng',
      date: new Date('2024-01-12'),
      author: 'BS. Trần Thị Bình',
      readTime: '3 phút',
      featured: false,
      tags: ['Nhi khoa', 'Miễn phí', 'Cộng đồng']
    },
    {
      id: 3,
      title: 'Hướng dẫn phòng chống cúm mùa hiệu quả cho gia đình',
      excerpt: 'Với mùa cúm đang đến gần, các chuyên gia của chúng tôi chia sẻ những biện pháp phòng ngừa hiệu quả để bảo vệ sức khỏe gia đình bạn.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      category: 'Sức khỏe',
      date: new Date('2024-01-10'),
      author: 'BS. Lê Minh Cường',
      readTime: '7 phút',
      featured: false,
      tags: ['Phòng bệnh', 'Gia đình', 'Mùa đông']
    },
    {
      id: 4,
      title: 'Ra mắt dịch vụ tele-health: Tư vấn y tế từ xa',
      excerpt: 'Phòng khám chính thức triển khai dịch vụ tư vấn y tế trực tuyến, giúp bệnh nhân có thể được tư vấn từ các bác sĩ chuyên khoa mà không cần đến trực tiếp.',
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      category: 'Dịch vụ',
      date: new Date('2024-01-08'),
      author: 'BS. Phạm Thu Hà',
      readTime: '4 phút',
      featured: false,
      tags: ['Telemedicine', 'Online', 'Tiện lợi']
    }
  ];

  const healthTips = [
    {
      icon: Heart,
      title: 'Chăm sóc tim mạch',
      tip: 'Tập thể dục 30 phút mỗi ngày để duy trì sức khỏe tim mạch tốt',
      color: 'red'
    },
    {
      icon: Shield,
      title: 'Tăng cường miễn dịch',
      tip: 'Ăn nhiều trái cây, rau xanh và ngủ đủ 7-8 tiếng mỗi ngày',
      color: 'green'
    },
    {
      icon: TrendingUp,
      title: 'Kiểm tra định kỳ',
      tip: 'Khám sức khỏe tổng quát 6 tháng/lần để phát hiện sớm bệnh lý',
      color: 'blue'
    }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      'Công nghệ': 'bg-blue-100 text-blue-800',
      'Cộng đồng': 'bg-green-100 text-green-800',
      'Sức khỏe': 'bg-purple-100 text-purple-800',
      'Dịch vụ': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getIconColor = (color) => {
    const colors = {
      red: 'bg-red-100 text-red-600',
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Calendar className="w-4 h-4" />
            <span>Tin tức & Cập nhật</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Thông tin <span className="text-gradient">y tế</span> mới nhất
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Cập nhật những thông tin y tế mới nhất, các chương trình khuyến mãi 
            và mẹo chăm sóc sức khỏe từ đội ngũ chuyên gia của chúng tôi
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main News */}
          <div className="lg:col-span-2">
            {/* Featured Article */}
            {news.filter(article => article.featured).map((article) => (
              <div key={article.id} className="mb-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover group">
                  <div className="relative h-64 lg:h-80">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                        {article.category}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-bold mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-200 line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{article.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{article.readTime}</span>
                          </div>
                        </div>
                        <span>{format(article.date, 'dd/MM/yyyy', { locale: vi })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Other Articles */}
            <div className="grid md:grid-cols-2 gap-6">
              {news.filter(article => !article.featured).map((article) => (
                <div key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden card-hover group">
                  <div className="relative h-48">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                      <span>{format(article.date, 'dd/MM', { locale: vi })}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {article.tags.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center space-x-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          <Tag className="w-3 h-3" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>

                    <button className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm group/btn">
                      <span>Đọc thêm</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Health Tips */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Mẹo sức khỏe hàng ngày
              </h3>
              <div className="space-y-4">
                {healthTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColor(tip.color)}`}>
                      <tip.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{tip.title}</h4>
                      <p className="text-sm text-gray-600">{tip.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Đăng ký nhận tin
              </h3>
              <p className="text-gray-600 mb-4">
                Nhận thông tin y tế mới nhất và các chương trình khuyến mãi qua email
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button className="w-full btn-primary">
                  Đăng ký ngay
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Chúng tôi cam kết bảo mật thông tin cá nhân của bạn
              </p>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Liên kết nhanh
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/appointment')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <span className="font-medium text-gray-700">Đặt lịch khám</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => navigate('/services')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <span className="font-medium text-gray-700">Dịch vụ y tế</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => navigate('/doctors')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <span className="font-medium text-gray-700">Đội ngũ bác sĩ</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <span className="font-medium text-gray-700">Liên hệ</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsAndUpdates;