const express = require('express');
const router = express.Router();
const { matchSportPartners, getMatchCandidates, swipeMatch } = require('../controllers/matchController');
const { protect } = require('../middleware/auth');

router.get('/', protect, matchSportPartners);
// ➕ เพิ่ม: เอนด์พอยต์สำหรับระบบปัดหาคู่กีฬาแบบ Tinder
router.get('/candidates', protect, getMatchCandidates);
router.post('/swipe', protect, swipeMatch);

module.exports = router;
