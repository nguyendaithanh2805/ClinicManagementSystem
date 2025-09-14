import React from 'react';
import Navbar from './Navbar';
import NotificationPanel from './NotificationPanel';
import ChatPanel from './ChatPanel';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      <NotificationPanel />
      <ChatPanel />
    </div>
  );
};

export default DashboardLayout;