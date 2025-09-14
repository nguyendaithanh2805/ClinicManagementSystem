import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Brain, 
  Eye, 
  Bone, 
  Baby, 
  Stethoscope,
  ArrowRight,
  Star,
  Clock,
  Users
} from 'lucide-react';

const ServicesOverview = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: Heart,
      name: 'Tim Mạch',
      description: 'Chẩn đoán và điều trị các bệnh lý tim mạch với công nghệ hiện đại',
      features: ['Siêu âm tim', 'Điện tâm đồ', 'Holter 24h'],
      color: 'red',
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      icon: Brain,
      name: 'Thần Kinh',
      description: 'Điều trị chuyên sâu các bệnh lý thần kinh và tâm thần',
      features: ['MRI não', 'Điện não đồ', 'Tư vấn tâm lý'],
      color: 'purple',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      icon: Eye,
      name: 'Mắt',
      description: 'Khám và điều trị toàn diện các bệnh lý về mắt',
      features: ['Phẫu thuật mắt', 'Khúc xạ', 'Võng mạc'],
      color: 'blue',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      icon: Bone,
      name: 'Xương Khớp',
      description: 'Chẩn đoán và điều trị các bệnh lý xương khớp',
      features: ['X-quang', 'MRI khớp', 'Vật lý trị liệu'],
      color: 'green',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      icon: Baby,
      name: 'Nhi Khoa',
      description: 'Chăm sóc sức khỏe toàn diện cho trẻ em từ 0-16 tuổi',
      features: ['Tiêm chủng', 'Dinh dưỡng', 'Phát triển'],
      color: 'pink',
      image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      icon: Stethoscope,
      name: 'Nội Tổng Quát',
      description: 'Khám sức khỏe tổng quát và điều trị nội khoa',
      features: ['Khám định kỳ', 'Xét nghiệm', 'Tư vấn'],
      color: 'indigo',
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      red: 'bg-red-100 text-red-600 group-hover:bg-red-200',
      purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-200',
      blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-200',
      green: 'bg-green-100 text-green-600 group-hover:bg-green-200',
      pink: 'bg-pink-100 text-pink-600 group-hover:bg-pink-200',
      indigo: 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Stethoscope className="w-4 h-4" />
            <span>Dịch vụ y tế</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Chuyên khoa <span className="text-gradient">hàng đầu</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Với đội ngũ bác sĩ chuyên môn cao và trang thiết bị hiện đại, 
            chúng tôi cung cấp dịch vụ y tế chất lượng quốc tế
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden card-hover"
            >
              {/* Service Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center ${getColorClasses(service.color)} transition-colors duration-200`}>
                  <service.icon className="w-6 h-6" />
                </div>
              </div>

              {/* Service Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-200">
                  {service.name}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Service Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>4.9/5</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>1000+ bệnh nhân</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>30 phút</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => navigate('/services')}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-600 font-medium py-3 px-4 rounded-lg transition-all duration-200 group/btn"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary-500 to-blue-600 rounded-2xl p-8 lg:p-12 text-white">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              Không tìm thấy dịch vụ phù hợp?
            </h3>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Liên hệ với chúng tôi để được tư vấn miễn phí về các dịch vụ y tế phù hợp nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/contact')}
                className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Tư vấn miễn phí
              </button>
              <button
                onClick={() => navigate('/services')}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-all duration-200"
              >
                Xem tất cả dịch vụ
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;