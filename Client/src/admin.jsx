import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index-admin.css'
import AdminApp from "./AdminApp";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>
);
