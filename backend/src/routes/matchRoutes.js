const express = require('express');
const router = express.Router();
const { matchSportPartners } = require('../controllers/matchController');
const { protect } = require('../middleware/auth');

router.get('/', protect, matchSportPartners);

module.exports = router;
