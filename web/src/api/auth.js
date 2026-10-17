import client from './client';

// ➕ เพิ่ม: ใช้ endpoint login เดียวกับแอปมือถือ (ระบบ JWT เดียวกัน) ต่างกันแค่ต้อง role เป็น admin เท่านั้นถึงจะเข้าเว็บนี้ได้
export const loginRequest = (data) => client.post('/auth/login', data).then((r) => r.data);
