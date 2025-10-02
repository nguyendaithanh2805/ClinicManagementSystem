import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const { user, login, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Trang muốn redirect sau khi login thành công
  const from = location.state?.from?.pathname || "/";
  
  // Hàm chọn route theo role
  const getRedirectPath = (role) => {
    switch (role) {
      case "Patient":
        return from; // quay về trang trước khi bị chặn

      // DashboardPage sẽ chỉ được gọi khi URL = /dashboard.
      case "Doctor":
        return "/staff/doctor-dashboard"
      case "Receptionist":
        return "/staff/receptionist-dashboard"
      case "Lab_technician":
        return "/staff/lab-dashboard"
      case "Admin":
        return "/admin/admin-dashboard";
      default:
        return "/";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData);
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
    }
  };
  // https://chatgpt.com/share/68c92bfc-1514-8006-96b9-f8fa4adfdf79 - Giữ 2 root riêng, nhưng sửa luồng redirect là không bị lỗi BlankPage
  useEffect(() => {
    if (!loading && user) {
      window.location.href = getRedirectPath(user.role);
    }
  }, [user, loading]);



  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="flex w-full max-w-5xl rounded-2xl overflow-hidden shadow-xl bg-white">
        {/* Left side - Info */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-600 items-center justify-center p-10 text-white">
          <div className="space-y-6 max-w-md">
            <div className="flex items-center gap-3">
              <Heart className="w-10 h-10 text-white" />
              <h2 className="text-2xl font-bold">Phòng khám Đa khoa</h2>
            </div>
            <p className="text-lg leading-relaxed">
              Hệ thống quản lý khám chữa bệnh hiện đại.  
              Đặt lịch dễ dàng, quản lý hồ sơ y tế, kết nối nhanh với bác sĩ.
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 p-10 flex items-center">
          <div className="w-full space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Đăng nhập
              </h1>
              <p className="text-gray-600">
                Vui lòng nhập thông tin để truy cập hệ thống
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nhập tên đăng nhập"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nhập mật khẩu"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>

            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Phòng khám Đa khoa. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;