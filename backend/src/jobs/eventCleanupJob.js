const Event = require('../models/Event');
const Message = require('../models/Message');

// ➕ เพิ่ม: ให้เวลาผู้เล่น/ผู้จัดรีวิวกัน 5 นาทีหลังกิจกรรมจบ แล้วลบกิจกรรมทิ้งจริงจากฐานข้อมูล
// (ตั้งใจไม่ลบ Review ที่เกิดขึ้นแล้วตาม — ปล่อยให้ event ใน Review เป็นค่าว่างไป
// เพราะ Review คือของที่อยากเก็บไว้ ไม่ใช่สิ่งที่ควรหายไปพร้อม event)
const REVIEW_WINDOW_MS = 5 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 1000;

const cleanupCompletedEvents = async () => {
  try {
    const cutoff = new Date(Date.now() - REVIEW_WINDOW_MS);
    const events = await Event.find({ status: 'completed', completedAt: { $lte: cutoff } });

    for (const event of events) {
      // ลบแชทกลุ่มของกิจกรรมนี้ทิ้งไปด้วย ไม่มีประโยชน์อีกต่อไปหลัง event ถูกลบ
      // eslint-disable-next-line no-await-in-loop
      await Message.deleteMany({ event: event._id });
      // eslint-disable-next-line no-await-in-loop
      await event.deleteOne();
    }
  } catch (err) {
    console.error('Event cleanup check failed:', err.message);
  }
};

// Runs once immediately, then on a fixed interval for as long as the server
// process is alive.
const startEventCleanupJob = () => {
  cleanupCompletedEvents();
  setInterval(cleanupCompletedEvents, CHECK_INTERVAL_MS);
};

module.exports = { startEventCleanupJob, cleanupCompletedEvents };
