import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Award, 
  Calendar, 
  MapPin,
  ArrowRight,
  GraduationCap,
  Clock,
  Users
} from 'lucide-react';

const DoctorsHighlight = () => {
  const navigate = useNavigate();

  const doctors = [
    {
      id: 1,
      name: 'BS.CKI Nguyễn Văn An',
      specialty: 'Tim Mạch',
      experience: '15 năm',
      education: 'Đại học Y Hà Nội',
      rating: 4.9,
      patients: '2000+',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      achievements: ['Bác sĩ xuất sắc 2023', 'Chứng chỉ ESC'],
      availableToday: true,
      nextSlot: '14:30'
    },
    {
      id: 2,
      name: 'BS.CKII Trần Thị Bình',
      specialty: 'Nhi Khoa',
      experience: '12 năm',
      education: 'Đại học Y TP.HCM',
      rating: 4.8,
      patients: '1800+',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      achievements: ['Chuyên gia nhi khoa', 'Giải thưởng y tế'],
      availableToday: true,
      nextSlot: '15:00'
    },
    {
      id: 3,
      name: 'BS.CKI Lê Minh Cường',
      specialty: 'Thần Kinh',
      experience: '18 năm',
      education: 'Đại học Y Huế',
      rating: 4.9,
      patients: '2200+',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      achievements: ['Tiến sĩ Y học', 'Chứng chỉ quốc tế'],
      availableToday: false,
      nextSlot: 'Ngày mai 9:00'
    },
    {
      id: 4,
      name: 'BS.CKII Phạm Thu Hà',
      specialty: 'Mắt',
      experience: '10 năm',
      education: 'Đại học Y Dược TP.HCM',
      rating: 4.7,
      patients: '1500+',
      image: 'https://images.unsplash.com/photo-1594824475317-8e3f8e6e3e3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      achievements: ['Chuyên gia phẫu thuật mắt', 'Học bổng Mỹ'],
      availableToday: true,
      nextSlot: '16:30'
    }
  ];

  const handleBookAppointment = (doctorId) => {
    navigate(`/appointment?doctor=${doctorId}`);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            <span>Đội ngũ y bác sĩ</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Bác sĩ <span className="text-gradient">hàng đầu</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Đội ngũ bác sĩ giàu kinh nghiệm, được đào tạo bài bản và có chuyên môn cao, 
            luôn tận tâm chăm sóc sức khỏe của bạn
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden card-hover group"
            >
              {/* Doctor Image */}
              <div className="relative">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* Availability Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                  doctor.availableToday 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {doctor.availableToday ? 'Có lịch hôm nay' : 'Hẹn ngày khác'}
                </div>

                {/* Rating */}
                <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900">{doctor.rating}</span>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors duration-200">
                    {doctor.name}
                  </h3>
                  <p className="text-primary-600 font-medium mb-2">{doctor.specialty}</p>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>{doctor.education}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4" />
                      <span>{doctor.experience} kinh nghiệm</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{doctor.patients} bệnh nhân</span>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {doctor.achievements.map((achievement, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full"
                      >
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Next Available Slot */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Lịch gần nhất:</span>
                    <span className="font-medium text-gray-900">{doctor.nextSlot}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleBookAppointment(doctor.id)}
                    className="w-full btn-primary flex items-center justify-center space-x-2 py-2.5"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Đặt lịch khám</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/doctors')}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-all duration-200 group/btn"
                  >
                    <span>Xem hồ sơ</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 border border-gray-100">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Tìm bác sĩ phù hợp với bạn
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Với hơn 50 bác sĩ chuyên khoa, chúng tôi cam kết tìm được người phù hợp nhất cho nhu cầu của bạn
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/doctors')}
                  className="btn-primary flex items-center justify-center space-x-2"
                >
                  <Users className="w-5 h-5" />
                  <span>Xem tất cả bác sĩ</span>
                </button>
                
                <button
                  onClick={() => navigate('/appointment')}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Đặt lịch tư vấn</span>
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-8 mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-600">50+</p>
                  <p className="text-gray-600 font-medium">Bác sĩ chuyên khoa</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-600">25+</p>
                  <p className="text-gray-600 font-medium">Chuyên khoa</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-600">98%</p>
                  <p className="text-gray-600 font-medium">Hài lòng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoctorsHighlight;