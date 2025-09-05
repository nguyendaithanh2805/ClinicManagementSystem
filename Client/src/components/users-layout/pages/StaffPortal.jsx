import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserCheck, BarChart, Users, Settings } from 'lucide-react';

const StaffPortal = () => {
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
            <UserCheck className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cổng Nhân Viên</h1>
            <p className="text-gray-600">Quản lý hoạt động phòng khám</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <BarChart className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Báo cáo thống kê</h3>
              <p className="text-gray-600 mb-4">Xem báo cáo hoạt động và doanh thu</p>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Xem báo cáo →
              </button>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <Users className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quản lý bệnh nhân</h3>
              <p className="text-gray-600 mb-4">Quản lý thông tin và lịch hẹn bệnh nhân</p>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Quản lý →
              </button>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <Settings className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Cài đặt hệ thống</h3>
              <p className="text-gray-600 mb-4">Cấu hình và quản lý hệ thống</p>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Cài đặt →
              </button>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <UserCheck className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quản lý nhân viên</h3>
              <p className="text-gray-600 mb-4">Quản lý thông tin và lịch làm việc</p>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Quản lý →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPortal;