import axios from 'axios';
import { toast } from 'react-toastify';
import { decodeJwt } from '../../../utils/jwtHelper'

// axios interceptor
const API_BASE_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_BASE_URL });

/**
 * Hàm gắn interceptor
 * Truyền authContext từ component chính
 */
export const setupAxiosInterceptors = (authContext) => {
  api.interceptors.request.use(
    (config) => {
      const user = authContext?.user;
      if (user?.token) {
        const decoded = decodeJwt(user.token);
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp < now) {
          // Token hết hạn → logout ngay
          authContext.logout();
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
          return Promise.reject('Token expired');
        }

        // Gắn header Authorization
        config.headers['Authorization'] = `Bearer ${user.token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

export default api;
