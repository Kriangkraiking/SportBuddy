import client from './client';

// ➕ เพิ่ม: แยก user CRUD ออกมาเป็น api wrapper เฉพาะ (เดิมเรียก client ตรงๆ ในหน้า UserManagement.jsx)
export const listUsersRequest = () => client.get('/users').then((r) => r.data);
export const deleteUserRequest = (id) => client.delete(`/users/${id}`).then((r) => r.data);
// ➕ เพิ่ม: แก้ไขข้อมูล user + กำหนด role ผ่านเว็บแอดมิน (backend จำกัดไว้แค่ name/email/role/bio เท่านั้น)
export const updateUserRequest = (id, data) => client.put(`/users/admin/${id}`, data).then((r) => r.data);
