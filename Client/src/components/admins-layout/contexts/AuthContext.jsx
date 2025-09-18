import { jwtDecode } from 'jwt-decode';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { decodeJwt } from '../../../utils/jwtHelper'

// Tạo context để chia sẻ dữ liệu đăng nhập cho toàn ứng dụng
const AuthContext = createContext();

/**
 * Hook tiện lợi: thay vì dùng useContext(AuthContext) mỗi lần,
 * ta tạo sẵn useAuth() để gọi cho ngắn gọn
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Component AuthProvider: bọc toàn bộ ứng dụng
 * => cung cấp dữ liệu đăng nhập (user, login, logout...) cho các component con
 */
export const AuthProvider = ({ children }) => {
   // State lưu thông tin người dùng hiện tại
  const [user, setUser] = useState(null);

  // State kiểm tra đang tải (dùng để hiển thị spinner hoặc loading UI)
  const [loading, setLoading] = useState(true);

    /**
   * useEffect: chạy 1 lần khi component mount
   * => Kiểm tra xem trong localStorage có lưu user từ lần đăng nhập trước không
   * Nếu có thì khôi phục lại
   */
  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('clinic_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('clinic_user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Hàm login: gọi API backend để đăng nhập
   * - Gửi username + password
   * - Nếu thành công => nhận về token
   * - Giải mã token để lấy roleId
   * - Map roleId sang roleName
   * - Lưu user vào state + localStorage
   */
  const login = async (credentials) => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        })
      });

      const result = await response.json();
      if (!response.ok || result.status === false)
        throw new Error(result.message || 'Đăng nhập thất bại');

      // Decode token để lấy role
      const decoded = jwtDecode(result.data.token);
      const roleName = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      const userData = {
        username: credentials.username,
        token: result.data.token,
        expiredAt: result.data.expiredAt,
        role: roleName
      };

      // Cập nhật state và localStorage
      setUser(userData);
      localStorage.setItem('clinic_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hàm logout: xoá user khỏi state và localStorage
   * => Quay lại trạng thái chưa đăng nhập
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('clinic_user');
  };

  // Dữ liệu sẽ được chia sẻ qua context cho các component con
  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};