import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import './index-admin.css';
import AdminApp from './AdminApp';

const path = window.location.pathname;

if (path.startsWith('/patient') || path.startsWith('/staff') || path.startsWith('/admin')) {
  createRoot(document.getElementById('root-admin')).render(
    <AdminApp />

  );
} else {
  createRoot(document.getElementById('root-user')).render(
    <App />
  );
}