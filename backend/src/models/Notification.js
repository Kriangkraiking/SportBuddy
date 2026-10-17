const mongoose = require('mongoose');

// A single in-app notification for a user — e.g. "someone added you as a
// friend" or "your match starts soon".
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      // ➕ เพิ่ม: 'buddy_matched' สำหรับระบบปัดหาคู่กีฬาแบบ Tinder เมื่อทั้งสองฝ่ายปัดขวาให้กัน
      // ➕ เพิ่ม: 'review_received' สำหรับระบบรีวิวหลังกิจกรรมจบ
      // ➕ เพิ่ม: 'event_join_requested' (ไปหา host ตอนมีคนขอเข้าร่วม), 'event_join_approved' (ไปหาผู้เล่นตอน host อนุมัติ)
      // เก็บ 'event_joined' เดิมไว้เผื่อมี Notification เก่าในฐานข้อมูลอยู่แล้ว แต่โค้ดใหม่ไม่สร้างชนิดนี้เพิ่มอีกแล้ว
      enum: [
        'friend_request',
        'friend_accepted',
        'event_joined',
        'event_reminder',
        'buddy_matched',
        'review_received',
        'event_join_requested',
        'event_join_approved',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
