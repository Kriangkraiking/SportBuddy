const mongoose = require('mongoose');

// ➕ เพิ่ม: รีวิวระหว่างผู้จัดกิจกรรมกับผู้เข้าร่วม หลังกิจกรรมจบแล้วเท่านั้น
// (from -> to ต่อหนึ่ง event) ไม่มีรีวิวระหว่างผู้เข้าร่วมด้วยกันเอง — ดู reviewController สำหรับกฎว่าใครรีวิวใครได้
const reviewSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

// กันรีวิวคนเดิมซ้ำสำหรับ event เดียวกัน
reviewSchema.index({ event: 1, from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
