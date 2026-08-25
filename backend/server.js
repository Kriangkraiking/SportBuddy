require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// --- 1. เพิ่มการ Import Models ตรงนี้ ---
// (เช็ก path ให้ตรงกับโฟลเดอร์เก็บ Model ของ SportBuddy ด้วยนะครับ)
const User = require('./src/models/User');
const Match = require('./src/models/Event');
// หากมีการทำ Model สำหรับสนามและระบบ Report แล้ว ให้เอาคอมเมนต์ด้านล่างออกครับ
// const Facility = require('./src/models/Facility');
// const Report = require('./src/models/Report');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const buddyRoutes = require('./src/routes/buddyRoutes');
const matchRoutes = require('./src/routes/matchRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const { startEventReminderJob } = require('./src/jobs/eventReminderJob');

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files (profile pictures, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SportBuddy API is running' });
});

// --- 2. อัปเดต API Dashboard ให้ดึงข้อมูลจริง ---
app.get('/api/dashboard', async (req, res) => {
  try {
    // สั่งให้นับจำนวนข้อมูลใน MongoDB พร้อมกันทั้งหมดเพื่อความรวดเร็ว
    const [
      realUserCount,
      realActiveMatches,
      // realTotalFields,
      // realAvailableFields,
      // realPendingReports
    ] = await Promise.all([
      User.countDocuments(),
      Match.countDocuments({ status: 'active' }), // เช็กสถานะ active ให้ตรงกับที่ตั้งไว้ใน Database
      // Facility.countDocuments(),
      // Facility.countDocuments({ status: 'available' }),
      // Report.countDocuments({ status: 'pending' })
    ]);

    // จับข้อมูลจริงใส่ตัวแปรเตรียมส่งกลับ
    const dashboardStats = {
      totalUsers: realUserCount || 0,
      activeMatches: realActiveMatches || 0,
      // สำหรับข้อมูลที่ยังไม่มี Model ผมใส่เลขจำลองไว้ให้ก่อน หน้าเว็บจะได้ไม่ Error ครับ
      availableFields: 5,
      totalFields: 8,
      pendingReports: 2
    };

    res.status(200).json(dashboardStats);

  } catch (error) {
    console.error("เกิดข้อผิดพลาดที่ Dashboard API:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/buddies', buddyRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`SportBuddy API running on port ${PORT}`);
  });
  startEventReminderJob();
});

module.exports = app;