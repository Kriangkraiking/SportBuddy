// ➕ เพิ่ม: สมัครบัญชีใหม่ + ตั้งเป็น admin ในขั้นตอนเดียว (ใช้ตอนบัญชียังไม่เคยสมัครมาก่อน)
// รัน: cd backend && node scripts/createAdmin.js you@example.com "YourName" "YourPassword1"
// กฎรหัสผ่าน (เหมือนตอนสมัครผ่านแอป): อย่างน้อย 6 ตัวอักษร และมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const [email, name, password] = process.argv.slice(2);
if (!email || !name || !password) {
  console.error('วิธีใช้: node scripts/createAdmin.js <email> <name> <password>');
  process.exit(1);
}
if (password.length < 6 || !/[A-Z]/.test(password)) {
  console.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร และมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว');
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sportbuddy')
  .then(async () => {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      console.error('อีเมลนี้มีบัญชีอยู่แล้ว ใช้ scripts/setAdmin.js แทนถ้าแค่จะตั้งเป็น admin');
      await mongoose.disconnect();
      process.exit(1);
    }

    // password ถูก hash อัตโนมัติผ่าน pre('save') hook ใน User model อยู่แล้ว
    const user = await User.create({ email: email.toLowerCase().trim(), name, password, role: 'admin' });
    console.log(`สร้างบัญชี ${user.email} เป็น admin เรียบร้อยแล้ว`);
    await mongoose.disconnect();
  })
  .catch((err) => {
    console.error('ทำรายการไม่สำเร็จ:', err.message);
    process.exit(1);
  });
