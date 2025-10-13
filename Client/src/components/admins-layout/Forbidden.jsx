import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../users-layout/layout/Header';
import Footer from '../users-layout/layout/Footer';

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-2xl bg-white shadow-lg rounded-2xl p-8 text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Không có quyền truy cập</h1>
            <p className="text-gray-700 mb-6">Xin lỗi, bạn không được phép xem trang này.</p>
            <Link
            to="/"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
            Quay về trang chủ
            </Link>
        </div>
        </div>
    </div>
  );
};

export default Forbidden;