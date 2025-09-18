import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../admins-layout/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { useLocation } from 'react-router-dom';
import Forbidden from './Forbidden';

// ..\ClinicManagementSystem\Client\src\AdminApp.jsx
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

   if (!user) {
    // Chưa login → redirect về login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Đăng nhập rồi nhưng không có quyền → hiển thị Forbidden
    return <Navigate to= "/forbidden" />;
  }

  return children;
};

export default ProtectedRoute;