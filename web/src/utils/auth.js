// ➕ เพิ่ม: จัดการ session ของแอดมินที่ล็อกอินไว้ ผ่าน localStorage (ไม่มี Context เพราะเว็บนี้มีแค่ไม่กี่หน้า)
const STORAGE_KEY = 'sportbuddy_admin_session';

export function saveSession(user, token) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function getToken() {
  return getSession()?.token || null;
}

export function isAdmin() {
  return getSession()?.user?.role === 'admin';
}
