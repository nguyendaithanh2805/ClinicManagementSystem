import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_BASE_URL });

let logoutTimer = null;

export const setupAxiosInterceptors = () => {
  api.interceptors.request.use(
    (config) => {
      // Lấy user từ localStorage thay vì từ context vì reload lại là mất (lỗi đã gặp)
      const savedUser = localStorage.getItem('clinic_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          if (user?.token) {
            const decoded = jwtDecode(user.token);
            const now = Math.floor(Date.now() / 1000);
            const remaining = (decoded.exp - now) * 1000;

            if (remaining <= 0) {
              // Token đã hết hạn
              localStorage.removeItem('clinic_user');
              toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
              return Promise.reject(new Error("Token expired"));
            }

            // Clear timer cũ nếu có
            if (logoutTimer) clearTimeout(logoutTimer);

            // Set timer mới đến lúc hết hạn
            logoutTimer = setTimeout(() => {
              localStorage.removeItem('clinic_user');
              toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
              window.location.href = "/login"; // tự logout
            }, remaining);

            // Gắn Authorization header
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${user.token}`;
            // console.log("Attached header:", config.headers.Authorization);
          }
        } catch (err) {
          console.error("Invalid saved user in localStorage:", err);
          localStorage.removeItem('clinic_user');
        }
      }

      // console.log("Interceptor config before return:", config);
      return config;
    },
    (error) => Promise.reject(error)
  );
};

export default api;
