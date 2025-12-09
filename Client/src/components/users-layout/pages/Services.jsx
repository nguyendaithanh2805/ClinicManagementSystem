import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { ArrowLeft, Stethoscope, Search } from 'lucide-react';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Lấy tên chuyên khoa dựa vào specialtyId
  const fetchSpecialtyName = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/specialties/${id}`);
      const result = await res.json();
      return res.ok && result.status ? result.data.name : 'Không xác định';
    } catch {
      return 'Không xác định';
    }
  };
  /*
    {
    "status": true,
    "message": "Lấy dữ liệu thành công",
    "data": [
        {
            "id": 1,
            "specialtyId": 1,
            "name": "Khám nội tổng quát",
            "cost": 200000
        },
        {
            "id": 2,
            "specialtyId": 2,
            "name": "Khám nhi khoa",
            "cost": 250000
        },
        {
            "id": 3,
            "specialtyId": 3,
            "name": "Xét nghiệm máu",
            "cost": 150000
            }
        ]
    }
  */
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/medical-services`);
        const result = await response.json();

        if (response.ok && result.status) {
          const servicesWithSpecialty = await Promise.all(
            result.data.map(async (service) => {
              
              // Lấy tên chuyên khoa
              const specialtyName = await fetchSpecialtyName(service.specialtyId);
              return { ...service, specialtyName };
            })
          );
          setServices(servicesWithSpecialty); // Lưu vào state
        } else {
          setError(result.message || 'Không thể tải dữ liệu dịch vụ');
        }
      } catch (err) {
        console.error(err);
        setError('Lỗi kết nối đến server');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Lọc dịch vụ y tế theo tên
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
    <Header 
    />
    

    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Về trang chủ</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-12">
            <Stethoscope className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dịch Vụ Y Tế</h1>
            <p className="text-gray-600">Các chuyên khoa và dịch vụ y tế chất lượng cao</p>
          </div>
          
          {/* Search input */}
            <div className="mb-6 max-w-md mx-auto">
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm dịch vụ theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {loading ? (
              <p className="text-center text-gray-600">Đang tải dịch vụ...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : filteredServices.length === 0 ? (
              <p className="text-center text-gray-600">Không tìm thấy dịch vụ phù hợp</p>
            ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-xl p-6 shadow hover:shadow-lg transition"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h2>
                  <p className="text-gray-500 mb-1">
                    Chuyên khoa: <span className="font-medium">{service.specialtyName}</span>
                  </p>
                  <p className="text-gray-500 mb-3">
                    Chi phí: <span className="font-medium">{service.cost.toLocaleString()} VNĐ</span>
                  </p>
                  <Link
                  // truyền dữ liệu qua state
                  // Mục đích để khi người dùng nhấn nút đặt lịch thì chọn sẵn chuyên khoa luôn
                    to="/appointment" state={
                      {medicalServiceId: service.id}
                    }
                    className="inline-block btn-primary w-full text-center py-2 rounded-lg"
                  >
                    Đặt lịch khám
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>


    <Footer />
    </div>
  );
};

export default Services;
