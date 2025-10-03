import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_BASE_URL });

let logoutTimer = null;

export const setupAxiosInterceptors = () => {
  api.interceptors.request.use(
  (config) => {
    const savedUser = localStorage.getItem('clinic_user');

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user?.token) {
          const decoded = jwtDecode(user.token);
          const now = Math.floor(Date.now() / 1000);
          const remaining = (decoded.exp - now) * 1000;

          if (remaining <= 0) {
            localStorage.removeItem('clinic_user');
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            return Promise.reject(new Error("Token expired"));
          }

          if (logoutTimer) clearTimeout(logoutTimer);
          logoutTimer = setTimeout(() => {
            localStorage.removeItem('clinic_user');
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            window.location.href = "/login";
          }, remaining);

          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (err) {
        console.error("Invalid saved user in localStorage:", err);
        localStorage.removeItem('clinic_user');
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("clinic_user");
        toast.error("Bạn cần đăng nhập lại!");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
};

export default api;
