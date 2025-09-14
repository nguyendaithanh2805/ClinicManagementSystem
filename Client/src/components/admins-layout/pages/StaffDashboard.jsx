import React from 'react';
import DashboardLayout from '../DashboardLayout';
import StaffHeader from '../staff/StaffHeader';
import StaffStats from '../staff/StaffStats';
import TodaySchedule from '../staff/TodaySchedule';
import PatientQueue from '../staff/PatientQueue';
import QuickPatientSearch from '../staff/QuickPatientSearch';
import DepartmentOverview from '../staff/DepartmentOverview';

const StaffDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <StaffHeader />
        <StaffStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TodaySchedule />
            <PatientQueue />
          </div>
          
          <div className="space-y-6">
            <QuickPatientSearch />
            <DepartmentOverview />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;