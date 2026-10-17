const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sportbuddy';
    await mongoose.connect(uri);
    // ✏️ แก้ไข: เดิม log connection string เต็มๆ ซึ่งบน MongoDB Atlas มี username:password อยู่ จะไปโผล่ใน log ของ Render
    // เปลี่ยนให้ซ่อนส่วน credentials ก่อน log
    console.log('MongoDB connected:', uri.replace(/\/\/[^@/]+@/, '//***@'));
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
