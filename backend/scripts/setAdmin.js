// ➕ เพิ่ม: สคริปต์ตั้งค่า user ให้เป็น admin (ใช้แทน mongosh ที่เครื่องนี้ไม่มี)
// รัน: cd backend && node scripts/setAdmin.js you@example.com
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const email = process.argv[2];
if (!email) {
  console.error('วิธีใช้: node scripts/setAdmin.js <email>');
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sportbuddy')
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { role: 'admin' },
      { new: true }
    );
    if (!user) {
      console.error('ไม่พบผู้ใช้ที่มีอีเมลนี้:', email);
    } else {
      console.log(`ตั้ง ${user.email} เป็น admin แล้ว (role: ${user.role})`);
    }
    await mongoose.disconnect();
  })
  .catch((err) => {
    console.error('เชื่อมต่อ MongoDB ไม่สำเร็จ:', err.message);
    process.exit(1);
  });
