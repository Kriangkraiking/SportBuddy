const express = require('express');
const router = express.Router();
const {
  searchBuddies,
  sendRequest,
  respondToRequest,
  listRequests,
} = require('../controllers/buddyController');
const { protect } = require('../middleware/auth');

router.get('/search', protect, searchBuddies);
router.get('/requests', protect, listRequests);
router.post('/request', protect, sendRequest);
router.put('/request/:id', protect, respondToRequest);

module.exports = router;
