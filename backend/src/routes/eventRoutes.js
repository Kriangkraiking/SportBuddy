const express = require('express');
const router = express.Router();
const {
  createEvent,
  listEvents,
  getEvent,
  joinEvent,
  leaveEvent,
  approveJoinRequest,
  declineJoinRequest,
  updateEvent,
  completeEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { listMessages, sendMessage } = require('../controllers/messageController');
// ➕ เพิ่ม: เอนด์พอยต์รีวิวหลังกิจกรรมจบ
const { createReview, listEventReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, listEvents).post(protect, createEvent);
router.route('/:id').get(protect, getEvent).put(protect, updateEvent).delete(protect, deleteEvent);
router.post('/:id/join', protect, joinEvent);
router.post('/:id/leave', protect, leaveEvent);
// ➕ เพิ่ม: host อนุมัติ/ปฏิเสธคำขอเข้าร่วม
router.post('/:id/approve/:userId', protect, approveJoinRequest);
router.post('/:id/decline/:userId', protect, declineJoinRequest);
router.post('/:id/complete', protect, completeEvent);
router.route('/:id/messages').get(protect, listMessages).post(protect, sendMessage);
router.route('/:id/reviews').get(protect, listEventReviews).post(protect, createReview);

module.exports = router;
