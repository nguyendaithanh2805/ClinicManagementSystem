import React from 'react';
import DashboardLayout from '../DashboardLayout';
import PatientHeader from '../patient/PatientHeader';
import PatientStats from '../patient/PatientStats';
import UpcomingAppointments from '../patient/UpcomingAppointments';
import RecentMedicalRecords from '../patient/RecentMedicalRecords';
import MedicationReminders from '../patient/MedicationReminders';
import QuickActions from '../patient/QuickActions';

const PatientDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PatientHeader />
        <PatientStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <UpcomingAppointments />
            <RecentMedicalRecords />
          </div>
          
          <div className="space-y-6">
            <QuickActions />
            <MedicationReminders />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;