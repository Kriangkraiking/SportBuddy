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
// ✏️ แก้ไข: ทำ Facility model แล้ว เอาคอมเมนต์ออก (Report ยังไม่มี ยังคงเป็นเลขจำลองต่อไป)
const Facility = require('./src/models/Facility');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const buddyRoutes = require('./src/routes/buddyRoutes');
const matchRoutes = require('./src/routes/matchRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
// ➕ เพิ่ม: Facility Management (ฝั่งแอดมินเท่านั้น)
const facilityRoutes = require('./src/routes/facilityRoutes');
const { startEventReminderJob } = require('./src/jobs/eventReminderJob');
// ➕ เพิ่ม: หลังกิจกรรมจบ 5 นาที (ให้เวลารีวิวกัน) ลบกิจกรรมทิ้งจริงจากฐานข้อมูล
const { startEventCleanupJob } = require('./src/jobs/eventCleanupJob');
// ➕ เพิ่ม: guard /api/dashboard ให้แอดมินเท่านั้นเข้าถึงได้ (เดิมไม่มี auth เลย)
const { protect } = require('./src/middleware/auth');
const { requireAdmin } = require('./src/middleware/admin');

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
// ✏️ แก้ไข: เพิ่ม protect + requireAdmin เดิม endpoint นี้ไม่มี auth เลย ใครก็ดูสถิติระบบได้
app.get('/api/dashboard', protect, requireAdmin, async (req, res) => {
  try {
    // สั่งให้นับจำนวนข้อมูลใน MongoDB พร้อมกันทั้งหมดเพื่อความรวดเร็ว
    const [
      realUserCount,
      realActiveMatches,
      realTotalFields,
      realAvailableFields,
      // realPendingReports — ยังไม่มี Report model เลยยังเป็นเลขจำลองต่อไป
    ] = await Promise.all([
      User.countDocuments(),
      // ✏️ แก้ไข: เดิมเช็ค status:'active' แต่ Event model ไม่มีค่านี้เลย (มีแค่ open/full/cancelled/completed)
      // ทำให้ตัวเลขนี้เป็น 0 เสมอ เปลี่ยนมานับ open+full แทน (แมตช์ที่ยังไม่จบ)
      Match.countDocuments({ status: { $in: ['open', 'full'] } }),
      // ✏️ แก้ไข: ทำ Facility model แล้ว ดึงข้อมูลจริงแทนเลขจำลอง
      Facility.countDocuments(),
      Facility.countDocuments({ status: 'available' }),
    ]);

    // จับข้อมูลจริงใส่ตัวแปรเตรียมส่งกลับ
    const dashboardStats = {
      totalUsers: realUserCount || 0,
      activeMatches: realActiveMatches || 0,
      availableFields: realAvailableFields || 0,
      totalFields: realTotalFields || 0,
      // pendingReports: ยังไม่มี Report model เลยใส่เลขจำลองไว้ก่อนเหมือนเดิม
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
app.use('/api/facilities', facilityRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`SportBuddy API running on port ${PORT}`);
  });
  startEventReminderJob();
  startEventCleanupJob();
});

module.exports = app;