import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend's address.
// - iOS simulator: http://localhost:5000/api
// - Android emulator: http://10.0.2.2:5000/api
// - Physical device: http://<your-computer-lan-ip>:5000/api
// ✏️ แก้ไข: อ่านจาก EXPO_PUBLIC_API_URL ก่อน (ตั้งใน eas.json ตอน build APK ให้ชี้ไป backend ที่ deploy จริงบน Render)
// ถ้าไม่ได้ตั้ง ใช้ค่า emulator เดิมสำหรับตอนพัฒนาในเครื่อง
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

// Base URL for static assets served by the backend (avatars, etc.) — same
// host as the API but without the /api suffix.
export const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const resolveAssetUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${ASSET_BASE_URL}${path}`;
};

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('sportbuddy_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
