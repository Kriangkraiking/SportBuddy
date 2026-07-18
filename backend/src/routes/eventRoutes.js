const express = require('express');
const router = express.Router();
const {
  createEvent,
  listEvents,
  getEvent,
  joinEvent,
  leaveEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, listEvents).post(protect, createEvent);
router.get('/:id', protect, getEvent);
router.post('/:id/join', protect, joinEvent);
router.post('/:id/leave', protect, leaveEvent);

module.exports = router;
