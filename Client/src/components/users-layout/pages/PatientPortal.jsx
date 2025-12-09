import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, FileText, Bell } from 'lucide-react';

const PatientPortal = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="text-center mb-8">
            <User className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cổng Bệnh Nhân</h1>
            <p className="text-gray-600">Quản lý thông tin và lịch khám của bạn</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <Calendar className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Đặt lịch khám</h3>
              <p className="text-gray-600 mb-4">Đặt lịch khám với bác sĩ chuyên khoa</p>
              <Link to="/appointment" className="text-primary-600 hover:text-primary-700 font-medium">
                Đặt lịch ngay →
              </Link>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <FileText className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Hồ sơ bệnh án</h3>
              <p className="text-gray-600 mb-4">Xem kết quả khám và hồ sơ bệnh án</p>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Xem hồ sơ →
              </button>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <Bell className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Thông báo</h3>
              <p className="text-gray-600 mb-4">Nhận thông báo về lịch khám và kết quả</p>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Xem thông báo →
              </button>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <User className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Thông tin cá nhân</h3>
              <p className="text-gray-600 mb-4">Cập nhật thông tin liên hệ và bảo hiểm</p>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Cập nhật →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPortal;