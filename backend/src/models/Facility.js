const mongoose = require('mongoose');

// ➕ เพิ่ม: สนาม/สถานที่เล่นกีฬาที่แอดมินลงทะเบียนไว้ — จัดการฝั่งเว็บแอดมินเท่านั้น
// (ยังไม่เชื่อมกับแอปมือถือ/การสร้างกิจกรรม เป็นแค่ทะเบียนข้อมูลของแอดมิน)
const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sport: { type: String, required: true },
    address: { type: String, default: '' },
    capacity: { type: Number, default: 0 },
    status: { type: String, enum: ['available', 'unavailable'], default: 'available' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Facility', facilitySchema);
