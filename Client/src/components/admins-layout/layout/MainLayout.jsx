import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import NotificationPanel from '../NotificationPanel';
import ChatPanel from '../ChatPanel';

const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <ChatPanel />
    </div>
  );
};

export default MainLayout;