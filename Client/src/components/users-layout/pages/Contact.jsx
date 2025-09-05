import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';

const Contact = () => {
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
            <Phone className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Liên Hệ</h1>
            <p className="text-gray-600">Thông tin liên hệ và địa chỉ phòng khám</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <Phone className="w-8 h-8 text-primary-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Điện thoại</h3>
              <p className="text-gray-600">0123-456-789</p>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <Mail className="w-8 h-8 text-primary-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-gray-600">info@medicare.vn</p>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <MapPin className="w-8 h-8 text-primary-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Địa chỉ</h3>
              <p className="text-gray-600">123 Đường ABC, Quận 1, TP.HCM</p>
            </div>
          </div>

          <div className="text-center">
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

export default Contact;