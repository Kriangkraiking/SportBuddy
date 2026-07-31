const express = require('express');
const router = express.Router();
const {
  createEvent,
  listEvents,
  getEvent,
  joinEvent,
  leaveEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { listMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, listEvents).post(protect, createEvent);
router.route('/:id').get(protect, getEvent).put(protect, updateEvent).delete(protect, deleteEvent);
router.post('/:id/join', protect, joinEvent);
router.post('/:id/leave', protect, leaveEvent);
router.route('/:id/messages').get(protect, listMessages).post(protect, sendMessage);

module.exports = router;
