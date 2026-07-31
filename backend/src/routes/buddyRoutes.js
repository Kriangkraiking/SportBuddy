const express = require('express');
const router = express.Router();
const {
  searchBuddies,
  sendRequest,
  respondToRequest,
  listRequests,
  listFriends,
  findByUid,
} = require('../controllers/buddyController');
const { protect } = require('../middleware/auth');

router.get('/search', protect, searchBuddies);
router.get('/requests', protect, listRequests);
router.get('/friends', protect, listFriends);
router.get('/uid/:uid', protect, findByUid);
router.post('/request', protect, sendRequest);
router.put('/request/:id', protect, respondToRequest);

module.exports = router;
