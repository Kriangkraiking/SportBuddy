import axios from 'axios';
import { getToken, clearSession } from '../utils/auth';

// ➕ เพิ่ม: api client กลาง (เดิมแต่ละหน้าเรียก axios ตรงๆ พร้อม hardcode URL เอง ไม่มีจุดกลาง)
export const API_BASE_URL = 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// token หมดอายุ/ไม่ถูกต้อง หรือไม่ใช่แอดมิน (401/403) — เคลียร์ session แล้วเด้งกลับไปหน้า login
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearSession();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
