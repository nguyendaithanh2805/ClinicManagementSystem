import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/users-layout/pages/HomePage';
import PatientPortal from './components/users-layout/pages/PatientPortal';
import StaffPortal from './components/users-layout/pages/StaffPortal';
import AppointmentBooking from './components/users-layout/pages/AppointmentBooking';
import Services from './components/users-layout/pages/Services';
import Doctors from './components/users-layout/pages/Doctors';
import Contact from './components/users-layout/pages/Contact';
import About from './components/users-layout/pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/patient-portal" element={<PatientPortal />} />
          <Route path="/staff-portal" element={<StaffPortal />} />
          <Route path="/appointment" element={<AppointmentBooking />} />
          <Route path="/services" element={<Services />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;