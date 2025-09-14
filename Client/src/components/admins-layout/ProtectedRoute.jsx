import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../admins-layout/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { useLocation } from 'react-router-dom';

// ..\ClinicManagementSystem\Client\src\AdminApp.jsx
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Chưa login hoặc role không hợp lệ
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" state={{ from: location }} replace />; // state.from sẽ lưu lại trang hiện tại mà user muốn truy cập.
  }

  return children;
};

export default ProtectedRoute;