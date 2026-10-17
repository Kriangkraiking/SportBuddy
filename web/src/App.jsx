import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import หน้าต่างๆ เข้ามา (ตรวจสอบ Path ให้ตรงกับโฟลเดอร์ของคุณด้วยนะครับ)
import HomePage from './pages/Homepage';
import UserManagement from './pages/UserManagement';
// ➕ เพิ่ม: หน้า login + guard สำหรับ route ที่ต้องเป็นแอดมิน (เดิมไม่มี login เลย เรียก API ตรงๆ)
import Login from './pages/Login';
import RequireAdmin from './components/RequireAdmin';
// ➕ เพิ่ม: หน้า Facility Management (เดิมเป็นแค่ลิงก์ปลอม #fields)
import FacilityManagement from './pages/FacilityManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* เมื่อเปิดเว็บมาหน้าแรก (/) ให้แสดง HomePage — ต้องเป็นแอดมินเท่านั้น */}
        <Route
          path="/"
          element={
            <RequireAdmin>
              <HomePage />
            </RequireAdmin>
          }
        />

        {/* เมื่อเข้า URL /users ให้แสดงหน้า UserManagementPage — ต้องเป็นแอดมินเท่านั้น */}
        <Route
          path="/users"
          element={
            <RequireAdmin>
              <UserManagement />
            </RequireAdmin>
          }
        />

        {/* ➕ เพิ่ม: หน้า Facility Management — ต้องเป็นแอดมินเท่านั้น */}
        <Route
          path="/facilities"
          element={
            <RequireAdmin>
              <FacilityManagement />
            </RequireAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;