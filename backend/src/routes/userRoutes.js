const express = require('express');
const router = express.Router();
const { updateProfile, getUserById, uploadAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.put('/me', protect, updateProfile);
router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/:id', protect, getUserById);

module.exports = router;
