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
    window.location.href = `/login`;
  }

  if (!allowedRoles.includes(user.role)) {
    // Đăng nhập rồi nhưng không có quyền → hiển thị Forbidden
    return window.location.href = "/forbidden"; // <Navigate to= "/forbidden" />; 
  }

  return children;
};

export default ProtectedRoute;