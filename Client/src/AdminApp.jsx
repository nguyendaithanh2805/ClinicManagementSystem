import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/admins-layout/contexts/AuthContext';
import { NotificationProvider } from './components/admins-layout/contexts/NotificationContext';
import { ChatProvider } from './components/admins-layout/contexts/ChatContext';
import LoginPage from './components/admins-layout/pages/LoginPage';
import MainLayout from './components/admins-layout/layout/MainLayout';
import DashboardPage from './components/admins-layout/pages/DashboardPage';
import AppointmentsPage from './components/admins-layout/pages/AppointmentsPage';
import MedicalRecordsPage from './components/admins-layout/pages/MedicalRecordsPage';
import TestResultsPage from './components/admins-layout/pages/TestResultsPage';
import HealthTrackingPage from './components/admins-layout/pages/HealthTrackingPage';
import PatientsPage from './components/admins-layout/pages/PatientsPage';
import SchedulePage from './components/admins-layout/pages/SchedulePage';
import ProtectedRoute from './components/admins-layout/ProtectedRoute';
import ErrorBoundary from './components/admins-layout/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <ChatProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected Routes with Main Layout */}
                <Route path="/" element={
                  <ProtectedRoute allowedRoles={['patient', 'doctor', 'nurse', 'receptionist', 'lab_technician', 'admin']}>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="appointments" element={<AppointmentsPage />} />
                  
                  {/* Patient Routes */}
                  <Route path="medical-records" element={
                    <ProtectedRoute allowedRoles={['patient', 'doctor', 'nurse']}>
                      <MedicalRecordsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="test-results" element={
                    <ProtectedRoute allowedRoles={['patient', 'doctor', 'lab_technician']}>
                      <TestResultsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="health-tracking" element={
                    <ProtectedRoute allowedRoles={['patient', 'doctor', 'nurse']}>
                      <HealthTrackingPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Staff Routes */}
                  <Route path="patients" element={
                    <ProtectedRoute allowedRoles={['doctor', 'nurse', 'receptionist']}>
                      <PatientsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="schedule" element={
                    <ProtectedRoute allowedRoles={['doctor', 'nurse', 'receptionist']}>
                      <SchedulePage />
                    </ProtectedRoute>
                  } />
                  <Route path="examination" element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                      <div className="glass-effect rounded-2xl p-12 text-center">
                        <h2 className="text-xl font-bold text-medical-900 mb-4">Khám bệnh</h2>
                        <p className="text-medical-600">Tính năng đang được phát triển</p>
                      </div>
                    </ProtectedRoute>
                  } />
                  
                  {/* Lab Routes */}
                  <Route path="test-queue" element={
                    <ProtectedRoute allowedRoles={['lab_technician']}>
                      <div className="glass-effect rounded-2xl p-12 text-center">
                        <h2 className="text-xl font-bold text-medical-900 mb-4">Hàng đợi xét nghiệm</h2>
                        <p className="text-medical-600">Tính năng đang được phát triển</p>
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="sample-tracking" element={
                    <ProtectedRoute allowedRoles={['lab_technician']}>
                      <div className="glass-effect rounded-2xl p-12 text-center">
                        <h2 className="text-xl font-bold text-medical-900 mb-4">Theo dõi mẫu</h2>
                        <p className="text-medical-600">Tính năng đang được phát triển</p>
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="quality-control" element={
                    <ProtectedRoute allowedRoles={['lab_technician']}>
                      <div className="glass-effect rounded-2xl p-12 text-center">
                        <h2 className="text-xl font-bold text-medical-900 mb-4">Kiểm soát chất lượng</h2>
                        <p className="text-medical-600">Tính năng đang được phát triển</p>
                      </div>
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="user-management" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <div className="glass-effect rounded-2xl p-12 text-center">
                        <h2 className="text-xl font-bold text-medical-900 mb-4">Quản lý người dùng</h2>
                        <p className="text-medical-600">Tính năng đang được phát triển</p>
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="system-management" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <div className="glass-effect rounded-2xl p-12 text-center">
                        <h2 className="text-xl font-bold text-medical-900 mb-4">Quản lý hệ thống</h2>
                        <p className="text-medical-600">Tính năng đang được phát triển</p>
                      </div>
                    </ProtectedRoute>
                  } />
                  
                  {/* Common Routes */}
                  <Route path="settings" element={
                    <div className="glass-effect rounded-2xl p-12 text-center">
                      <h2 className="text-xl font-bold text-medical-900 mb-4">Cài đặt</h2>
                      <p className="text-medical-600">Tính năng đang được phát triển</p>
                    </div>
                  } />
                  <Route path="profile" element={
                    <div className="glass-effect rounded-2xl p-12 text-center">
                      <h2 className="text-xl font-bold text-medical-900 mb-4">Thông tin cá nhân</h2>
                      <p className="text-medical-600">Tính năng đang được phát triển</p>
                    </div>
                  } />
                  <Route path="reports" element={
                    <div className="glass-effect rounded-2xl p-12 text-center">
                      <h2 className="text-xl font-bold text-medical-900 mb-4">Báo cáo</h2>
                      <p className="text-medical-600">Tính năng đang được phát triển</p>
                    </div>
                  } />
                </Route>
                
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Router>
          </ChatProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;