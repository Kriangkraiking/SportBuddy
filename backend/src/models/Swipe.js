const mongoose = require('mongoose');

// ➕ เพิ่ม: บันทึกผลการ "ปัด" ของผู้ใช้ต่อผู้เล่นอีกคนหนึ่ง แยกตามชนิดกีฬา
// ต่างจาก BuddyRequest ตรงที่ swipe ซ้าย (ไม่สนใจ) จะไม่ไปสร้างคำขอเป็นเพื่อนใดๆ
// ต้องปัดขวาให้กันทั้งคู่ (mutual) ถึงจะกลายเป็น BuddyRequest สถานะ accepted จริง
const swipeSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sport: { type: String, required: true },
    direction: { type: String, enum: ['left', 'right'], required: true },
  },
  { timestamps: true }
);

swipeSchema.index({ from: 1, to: 1, sport: 1 }, { unique: true });

module.exports = mongoose.model('Swipe', swipeSchema);
