import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Stethoscope } from 'lucide-react';

const Services = () => {
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
            <Stethoscope className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dịch Vụ Y Tế</h1>
            <p className="text-gray-600">Các chuyên khoa và dịch vụ y tế chất lượng cao</p>
          </div>

          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Trang dịch vụ đang được phát triển</p>
            <Link
              to="/"
              className="btn-primary"
            >
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;