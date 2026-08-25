import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import หน้าต่างๆ เข้ามา (ตรวจสอบ Path ให้ตรงกับโฟลเดอร์ของคุณด้วยนะครับ)
import HomePage from './pages/Homepage'; 
import UserManagement from './pages/UserManagement'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* เมื่อเปิดเว็บมาหน้าแรก (/) ให้แสดง HomePage */}
        <Route path="/" element={<HomePage />} />
        
        {/* เมื่อเข้า URL /users ให้แสดงหน้า UserManagementPage */}
        <Route path="/users" element={<UserManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;