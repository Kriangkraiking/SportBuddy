import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin } from '../utils/auth';

// ➕ เพิ่ม: ห่อ route ที่ต้องเป็นแอดมินเท่านั้นถึงจะเข้าได้ ไม่งั้นเด้งไปหน้า login
export default function RequireAdmin({ children }) {
  if (!isAdmin()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
