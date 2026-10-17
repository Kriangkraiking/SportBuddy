// ➕ เพิ่ม: ตั้งรหัสผ่านใหม่ให้ user ที่มีอยู่แล้ว ผ่าน Mongoose .save() จริงๆ (ได้ bcrypt hash ที่ถูกต้อง)
// ใช้ตอนรหัสผ่านใน MongoDB เป็น plain text (เช่น พิมพ์ใส่ตรงๆ ผ่าน Compass/GUI แทนที่จะผ่านแอป/สคริปต์)
// รัน: cd backend && node scripts/resetPassword.js you@example.com "NewPassword1"
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('วิธีใช้: node scripts/resetPassword.js <email> <newPassword>');
  process.exit(1);
}
if (password.length < 6 || !/[A-Z]/.test(password)) {
  console.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร และมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว');
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sportbuddy')
  .then(async () => {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.error('ไม่พบผู้ใช้ที่มีอีเมลนี้:', email);
      await mongoose.disconnect();
      process.exit(1);
    }

    user.password = password;
    await user.save(); // ผ่าน pre('save') hook จริง เลยได้ bcrypt hash ที่ถูกต้อง (ต่างจากแก้ผ่าน GUI ตรงๆ)
    console.log(`ตั้งรหัสผ่านใหม่ให้ ${user.email} เรียบร้อยแล้ว ลอง login ด้วยรหัสผ่านนี้ได้เลย`);
    await mongoose.disconnect();
  })
  .catch((err) => {
    console.error('ทำรายการไม่สำเร็จ:', err.message);
    process.exit(1);
  });
