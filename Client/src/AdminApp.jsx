import { HashRouter as Router, Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/admins-layout/contexts/AuthContext';
import { NotificationProvider } from './components/admins-layout/contexts/NotificationContext';
import { ChatProvider } from './components/admins-layout/contexts/ChatContext';
import LoginPage from './components/admins-layout/pages/LoginPage';
import PatientDashboardContent from './components/admins-layout/dashboard/PatientDashboardContent';
import MainLayout from './components/admins-layout/layout/MainLayout';
import AppointmentsPage from './components/admins-layout/pages/AppointmentsPage';
import MedicalRecordsPage from './components/admins-layout/pages/MedicalRecordsPage';
import TestResultsPage from './components/admins-layout/pages/TestResultsPage';
import HealthTrackingPage from './components/admins-layout/pages/HealthTrackingPage';
import PatientsPage from './components/admins-layout/pages/PatientsPage';
import SchedulePage from './components/admins-layout/pages/SchedulePage';
import ProtectedRoute from './components/admins-layout/ProtectedRoute';
import ErrorBoundary from './components/admins-layout/ErrorBoundary';
import LabDashboardContent from './components/admins-layout/dashboard/LabDashboardContent';
import StaffDashboardContent from './components/admins-layout/dashboard/StaffDashboardContent';
import AdminDashboardContent from './components/admins-layout/dashboard/AdminDashboardContent';
import PaymentsPage from './components/admins-layout/pages/PaymentPages';
import { ToastContainer } from "react-toastify";
import { setupAxiosInterceptors } from "./components/admins-layout/contexts/Api";
import React, { useEffect } from 'react';
import LoadingSpinner from "./components/admins-layout/LoadingSpinner";
import AppointmentPageForDoctor from './components/admins-layout/doctor/AppointmentPageForDoctor';
import MedicalRecordPageForDoctor from './components/admins-layout/doctor/MedicalRecordPageForDoctor ';
import DoctorDashboardContent from './components/admins-layout/doctor/DoctorDashboardContent';
import LabTechnicianPage from './components/admins-layout/lab/LabTechnicianPage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </ErrorBoundary>
  )
}
function AppContent() {
  
  const { auth, loading } = useAuth();
  
  useEffect(() => {
    setupAxiosInterceptors(auth);
  }, [auth]);
  if (loading) return <LoadingSpinner />; 
  return (
    <NotificationProvider>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
            {/* For admin */}             
            {/* Patient Routes */}
            <Route path="/patient" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <MainLayout />
              </ProtectedRoute>
            }>
            <Route path="patient-dashboard" element={<PatientDashboardContent />} />
              <Route path="appointments" element={<AppointmentsPage /> } />
              <Route path="medical-records" element={ <MedicalRecordsPage /> } />
              <Route path="test-results" element={ <TestResultsPage /> } />
              <Route path="health-tracking" element={ <HealthTrackingPage /> } />
            </Route>

            {/* Staff Routes */}
            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={['Doctor','Receptionist', 'LabTechnician']}>
                <MainLayout />
              </ProtectedRoute>
            }>
              {/* Receptionist Routes */}
              <Route path="receptionist-dashboard" element={<StaffDashboardContent />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="patients" element={ <PatientsPage /> } />
              <Route path="medical-records" element={ <MedicalRecordsPage /> } />

              {/* Doctor Routes */}
              <Route path="doctor-dashboard" element={<DoctorDashboardContent />} />
              <Route path="schedule" element={ <AppointmentPageForDoctor /> } />
              <Route path="patient-medical-records" element={ <MedicalRecordPageForDoctor/> } />
             
              <Route path="lab-dashboard" element={<LabDashboardContent />} />
              <Route path="test-queue" element={<LabTechnicianPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <MainLayout />
              </ProtectedRoute>
            }> 
              <Route path="admin-dashboard" element={<AdminDashboardContent />} />
              <Route path="user-management" element={
                  <div className="glass-effect rounded-2xl p-12 text-center">
                    <h2 className="text-xl font-bold text-medical-900 mb-4">Quản lý người dùng</h2>
                    <p className="text-medical-600">Tính năng đang được phát triển</p>
                  </div>
              } />
              <Route path="system-management" element={
                  <div className="glass-effect rounded-2xl p-12 text-center">
                    <h2 className="text-xl font-bold text-medical-900 mb-4">Quản lý hệ thống</h2>
                    <p className="text-medical-600">Tính năng đang được phát triển</p>
                  </div>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    </NotificationProvider>
  );
}

export default App;