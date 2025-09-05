import React, { useState, useEffect } from 'react';
import Header from '../layout/Header';
import HeroSection from '../home/HeroSection';
import ServicesOverview from '../home/ServicesOverview';
import DoctorsHighlight from '../home/DoctorsHighlight';
import AppointmentCTA from '../home/AppointmentCTA';
import NewsAndUpdates from '../home/NewsAndUpdates';
import ContactInfo from '../home/ContactInfo';
import Footer from '../layout/Footer';
import LanguageSelector from '../common/LanguageSelector';
import SearchModal from '../common/SearchModal';

const HomePage = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('vi');
  const [clinicStatus, setClinicStatus] = useState('open');

  useEffect(() => {
    // Check clinic operating hours
    const checkClinicStatus = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      
      // Clinic hours: Mon-Sat 7:00-19:00, Sun 8:00-17:00
      if (day === 0) { // Sunday
        setClinicStatus(hour >= 8 && hour < 17 ? 'open' : 'closed');
      } else if (day >= 1 && day <= 6) { // Monday to Saturday
        setClinicStatus(hour >= 7 && hour < 19 ? 'open' : 'closed');
      } else {
        setClinicStatus('closed');
      }
    };

    checkClinicStatus();
    const interval = setInterval(checkClinicStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onSearchOpen={() => setIsSearchOpen(true)}
        clinicStatus={clinicStatus}
        currentLanguage={currentLanguage}
      />
      
      <main className="relative">
        <HeroSection clinicStatus={clinicStatus} />
        <ServicesOverview />
        <DoctorsHighlight />
        <AppointmentCTA />
        <NewsAndUpdates />
        <ContactInfo />
      </main>

      <Footer />

      <LanguageSelector 
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default HomePage;