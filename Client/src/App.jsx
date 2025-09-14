import { HashRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import HomePage from './components/users-layout/pages/HomePage';
import PatientPortal from './components/users-layout/pages/PatientPortal';
import StaffPortal from './components/users-layout/pages/StaffPortal';
import AppointmentBooking from './components/users-layout/pages/AppointmentBooking';
import Services from './components/users-layout/pages/Services';
import Doctors from './components/users-layout/pages/Doctors';
import Contact from './components/users-layout/pages/Contact';
import About from './components/users-layout/pages/About';
import ProtectedRoute from './components/admins-layout/ProtectedRoute';
import { AuthProvider } from './components/admins-layout/contexts/AuthContext';
import LoginPage from './components/admins-layout/pages/LoginPage';
import RegisterPage from './components/admins-layout/pages/RegisterPage';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/patient-portal" element={<PatientPortal />} />
            <Route path="/staff-portal" element={<StaffPortal />} />
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
    </AuthProvider>
  );
}

export default App;