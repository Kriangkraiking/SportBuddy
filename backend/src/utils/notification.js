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

// --- Events --------------------------------------------------------------

const notifyEventJoined = (hostId, joiner, event) =>
  createNotification({
    user: hostId,
    fromUser: joiner._id,
    event: event._id,
    type: 'event_joined',
    title: 'มีคนเข้าร่วมกิจกรรม',
    message: `${joiner.name} เข้าร่วม "${event.title}" ของคุณแล้ว`,
  });

const notifyEventReminder = (userId, event, minutesUntil) =>
  createNotification({
    user: userId,
    event: event._id,
    type: 'event_reminder',
    title: 'ใกล้ถึงเวลากิจกรรมแล้ว',
    message: `"${event.title}" จะเริ่มในอีกประมาณ ${minutesUntil} นาที`,
  });

module.exports = {
  createNotification,
  notifyFriendRequest,
  notifyFriendAccepted,
  notifyBuddyMatched,
  notifyEventJoined,
  notifyEventReminder,
};
