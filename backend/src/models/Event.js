const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    sport: { type: String, required: true },
    description: { type: String, default: '' },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // ➕ เพิ่ม: คนที่กด "เข้าร่วม" แต่ยังรอ host อนุมัติอยู่ — ยังไม่นับเป็นผู้เข้าร่วมจริง (ไม่กิน maxParticipants)
    // จนกว่า host จะอนุมัติแล้วค่อยย้ายไป participants (ดู eventController.approveJoinRequest)
    pendingParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxParticipants: { type: Number, default: 10 },
    dateTime: { type: Date, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
      address: { type: String, default: '' },
    },
    skillLevel: {
      type: String,
      enum: ['all', 'beginner', 'intermediate', 'advanced', 'pro'],
      default: 'all',
    },
    status: { type: String, enum: ['open', 'full', 'cancelled', 'completed'], default: 'open' },
    // Set once the "starting soon" reminder notification has gone out, so
    // the reminder job doesn't notify people twice for the same event.
    reminderSent: { type: Boolean, default: false },
    // ➕ เพิ่ม: เวลาที่ host กด "จบกิจกรรม" — ใช้นับเวลาปลดล็อกรีวิว 5 นาที แล้วให้ eventCleanupJob ลบทิ้งจริงหลังจากนั้น
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

eventSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Event', eventSchema);
