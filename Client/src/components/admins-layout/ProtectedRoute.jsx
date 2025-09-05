import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../admins-layout/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

// ..\ClinicManagementSystem\Client\src\AdminApp.jsx
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;