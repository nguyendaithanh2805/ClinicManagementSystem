  import { HashRouter as Router, Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
  import HomePage from './components/users-layout/pages/HomePage';
  import PatientPortal from './components/users-layout/pages/PatientPortal';
  import StaffPortal from './components/users-layout/pages/StaffPortal';
  import AppointmentBooking from './components/users-layout/pages/AppointmentBooking';
  import Services from './components/users-layout/pages/Services';
  import Doctors from './components/users-layout/pages/Doctors';
  import Contact from './components/users-layout/pages/Contact';
  import About from './components/users-layout/pages/About';
  import ProtectedRoute from './components/admins-layout/ProtectedRoute';
  import { AuthProvider, useAuth } from './components/admins-layout/contexts/AuthContext';
  import LoginPage from './components/admins-layout/pages/LoginPage';
  import RegisterPage from './components/admins-layout/pages/RegisterPage';
  import { ToastContainer } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import React, { useEffect } from 'react';
  import { setupAxiosInterceptors } from "./components/admins-layout/contexts/Api";
  import { NotificationProvider } from './components/admins-layout/contexts/NotificationContext';
  import { ChatProvider } from './components/admins-layout/contexts/ChatContext';
  import ErrorBoundary from './components/admins-layout/ErrorBoundary';
  import Forbidden from './components/admins-layout/Forbidden';

  function AppContent() {
    const auth = useAuth();

    useEffect(() => {
      setupAxiosInterceptors(auth);
    }, [auth]);

    return (
      <BrowserRouter>
        {/* For user */}
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/patient-portal" element={<PatientPortal />} />
            <Route path="/staff-portal" element={<StaffPortal />} />
            <Route path="/forbidden" element={<Forbidden />} />
            <Route 
              path="/appointment" 
              element={
                <ProtectedRoute allowedRoles={['Patient']}>
                <AppointmentBooking />
                </ProtectedRoute>
              }
            />
            <Route path="/services" element={<Services />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </BrowserRouter>

    );

  }
  function App() {
    return (
      <AuthProvider>
        <AppContent></AppContent>
      </AuthProvider>
    );
  }

  export default App;