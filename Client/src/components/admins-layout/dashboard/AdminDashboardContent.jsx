import React from 'react';
import AdminHeader from '../admin/AdminHeader';
import AdminStats from '../admin/AdminStats';
import SystemOverview from '../admin/SystemOverview';
import UserManagement from '../admin/UserManagement';
import RecentActivities from '../admin/RecentActivities';
import SystemHealth from '../admin/SystemHealth';

const AdminDashboardContent = () => {
  return (
    <>
      <AdminHeader />
      <AdminStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SystemOverview />
          <RecentActivities />
        </div>
        
        <div className="space-y-6">
          <UserManagement />
          <SystemHealth />
        </div>
      </div>
    </>
  );
};

export default AdminDashboardContent;