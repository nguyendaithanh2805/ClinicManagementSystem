import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import PatientDashboardContent from '../dashboard/PatientDashboardContent';
import StaffDashboardContent from '../dashboard/StaffDashboardContent';
import LabDashboardContent from '../dashboard/LabDashboardContent';
import AdminDashboardContent from '../dashboard/AdminDashboardContent';
// DashboardPage sẽ chỉ được gọi khi URL = /dashboard
const DashboardPage = () => {
  const { user } = useAuth();

  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'patient':
        return <PatientDashboardContent />;
      case 'doctor':
      case 'nurse':
      case 'receptionist':
        return <StaffDashboardContent />;
      case 'lab_technician':
        return <LabDashboardContent />;
      case 'admin':
        return <AdminDashboardContent />;
      default:
        return <div>Không có quyền truy cập</div>;
    }
  };

  return (
    <div className="space-y-6">
      {renderDashboardContent()}
    </div>
  );
};

export default DashboardPage;