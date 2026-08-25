const express = require('express');
const router = express.Router();

// ดึงฟังก์ชันมาครบทุกตัวในบรรทัดเดียว (ลบบรรทัดที่ซ้ำออกแล้ว)
// เพิ่ม deleteUser,updateUser
const { updateProfile, getUserById, uploadAvatar, getAllUsers,deleteUser,updateUser } = require('../controllers/userController');

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// วาง router.get('/') ไว้ด้านบน เพื่อป้องกัน Express สับสนกับตัวแปร /:id
router.get('/', getAllUsers);

router.put('/me', protect, updateProfile);
router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/:id', protect, getUserById);

//เพิ่ม เส้นทางการลบ และแก้ไข
router.delete('/:id', deleteUser);
router.put('/admin/:id', updateUser);

module.exports = router;