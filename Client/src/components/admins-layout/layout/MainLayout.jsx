import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import NotificationPanel from '../NotificationPanel';
import ChatPanel from '../ChatPanel';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <NotificationPanel />
      <ChatPanel />
    </div>
  );
};

export default MainLayout;