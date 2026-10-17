const Notification = require('../models/Notification');

// Central place that creates every notification in the app. Controllers call
// the specific `notifyX` helpers below instead of touching the Notification
// model directly, so the wording/shape of each notification type lives in
// one file.
//
// `createNotification` never throws — a notification failing to save should
// never break the action that triggered it (e.g. joining an event must still
// succeed even if the "host was notified" insert fails).
const createNotification = async ({ user, type, title, message = '', fromUser, event }) => {
  try {
    if (!user) return null;
    if (fromUser && String(user) === String(fromUser)) return null; // never notify yourself
    return await Notification.create({ user, type, title, message, fromUser, event });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
};

// --- Friends -----------------------------------------------------------

const notifyFriendRequest = (toUserId, fromUser) =>
  createNotification({
    user: toUserId,
    fromUser: fromUser._id,
    type: 'friend_request',
    title: 'คำขอเป็นเพื่อนใหม่',
    message: `${fromUser.name} ส่งคำขอเป็นเพื่อนถึงคุณ`,
  });

const notifyFriendAccepted = (toUserId, fromUser) =>
  createNotification({
    user: toUserId,
    fromUser: fromUser._id,
    type: 'friend_accepted',
    title: 'มีเพื่อนใหม่',
    message: `${fromUser.name} ตอบรับคำขอเป็นเพื่อนของคุณแล้ว`,
  });

// ➕ เพิ่ม: แจ้งเตือนเมื่อปัดหาคู่กีฬาแบบ Tinder แล้วทั้งสองฝ่ายปัดขวาให้กัน (mutual match)
const notifyBuddyMatched = (toUserId, otherUser, sport) =>
  createNotification({
    user: toUserId,
    fromUser: otherUser._id,
    type: 'buddy_matched',
    title: 'จับคู่กีฬาสำเร็จ!',
    message: `คุณกับ ${otherUser.name} จับคู่เล่น${sport}กันแล้ว ไปนัดกันได้เลย`,
  });

// ➕ เพิ่ม: แจ้งเตือนเมื่อได้รับรีวิวจากกิจกรรมที่จบแล้ว
const notifyReviewReceived = (toUserId, fromUser, event) =>
  createNotification({
    user: toUserId,
    fromUser: fromUser._id,
    event: event._id,
    type: 'review_received',
    title: 'มีรีวิวใหม่',
    message: `${fromUser.name} รีวิวให้คุณจากกิจกรรม "${event.title}"`,
  });

// --- Events --------------------------------------------------------------

// ✏️ แก้ไข: เดิมยิงตอน "เข้าร่วมสำเร็จเลย" (join ทันที ไม่ต้องรออนุมัติ) ตอนนี้ join ต้องรอ host
// อนุมัติก่อน เลยเปลี่ยนความหมาย/ข้อความเป็น "มีคนขอเข้าร่วม" แทน ยิงตอนกด join (ยังไม่ใช่ตอนเข้าร่วมสำเร็จจริง)
const notifyEventJoinRequested = (hostId, requester, event) =>
  createNotification({
    user: hostId,
    fromUser: requester._id,
    event: event._id,
    type: 'event_join_requested',
    title: 'มีคนขอเข้าร่วมกิจกรรม',
    message: `${requester.name} ขอเข้าร่วม "${event.title}" ของคุณ รอการอนุมัติจากคุณ`,
  });

// ➕ เพิ่ม: แจ้งผู้เล่นตอน host อนุมัติคำขอเข้าร่วมแล้ว (นี่คือจุดที่ถือว่า "เข้าร่วมสำเร็จ" จริง)
const notifyEventJoinApproved = (playerId, host, event) =>
  createNotification({
    user: playerId,
    fromUser: host._id,
    event: event._id,
    type: 'event_join_approved',
    title: 'ได้รับอนุมัติให้เข้าร่วมแล้ว',
    message: `ผู้จัดกิจกรรม "${event.title}" อนุมัติให้คุณเข้าร่วมแล้ว`,
  });

// ✏️ แก้ไข: เตือนก่อนเริ่ม 2 ชั่วโมงแล้ว ข้อความ "ประมาณ 120 นาที" อ่านยาก เลยแปลงเป็น ชั่วโมง/นาที
// และปัดเป็นช่วงละ 5 นาที (job เช็คทุก 5 นาที เวลาที่เหลือจริงจึงเป็น ~115-120 → แสดง "2 ชั่วโมง")
const formatTimeUntil = (minutes) => {
  const rounded = Math.max(5, Math.round(minutes / 5) * 5);
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  if (hours > 0 && mins > 0) return `${hours} ชั่วโมง ${mins} นาที`;
  if (hours > 0) return `${hours} ชั่วโมง`;
  return `${mins} นาที`;
};

const notifyEventReminder = (userId, event, minutesUntil) =>
  createNotification({
    user: userId,
    event: event._id,
    type: 'event_reminder',
    title: 'ใกล้ถึงเวลากิจกรรมแล้ว',
    message: `"${event.title}" จะเริ่มในอีกประมาณ ${formatTimeUntil(minutesUntil)}`,
  });

module.exports = {
  createNotification,
  notifyFriendRequest,
  notifyFriendAccepted,
  notifyBuddyMatched,
  notifyReviewReceived,
  notifyEventJoinRequested,
  notifyEventJoinApproved,
  notifyEventReminder,
};
