const express = require('express');
const router = express.Router();

// ดึงฟังก์ชันมาครบทุกตัวในบรรทัดเดียว (ลบบรรทัดที่ซ้ำออกแล้ว)
// เพิ่ม deleteUser,updateUser
const {
  updateProfile,
  getUserById,
  uploadAvatar,
  getAllUsers,
  deleteUser,
  updateUser,
  // ➕ เพิ่ม: ระบบบล็อกผู้เล่นส่วนตัว (host บล็อกผู้เล่นที่มีพฤติกรรมไม่เหมาะสม)
  blockUser,
  unblockUser,
  listBlockedUsers,
} = require('../controllers/userController');
// ➕ เพิ่ม: ดูรีวิวที่ user คนหนึ่งได้รับ (ใช้ในหน้าโปรไฟล์)
const { listUserReviews } = require('../controllers/reviewController');

const { protect } = require('../middleware/auth');
// ➕ เพิ่ม: guard เฉพาะแอดมิน — endpoint เหล่านี้ไม่เคยมี auth ผูกอยู่เลยมาก่อน (ใครก็เรียกได้แม้ไม่ login)
const { requireAdmin } = require('../middleware/admin');
const upload = require('../middleware/upload');

// ✏️ แก้ไข: เพิ่ม protect + requireAdmin — เดิม endpoint นี้ไม่มี auth เลย ใครก็ดึงรายชื่อ user ทั้งหมดได้
router.get('/', protect, requireAdmin, getAllUsers);

router.put('/me', protect, updateProfile);
router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/me/blocked', protect, listBlockedUsers);
router.get('/:id', protect, getUserById);
router.get('/:id/reviews', protect, listUserReviews);
router.post('/:id/block', protect, blockUser);
router.delete('/:id/block', protect, unblockUser);

//เพิ่ม เส้นทางการลบ และแก้ไข
// ✏️ แก้ไข: เพิ่ม protect + requireAdmin — เดิมลบ/แก้ไข user คนไหนก็ได้โดยไม่ต้อง login เลย เป็นช่องโหว่ความปลอดภัยจริง
router.delete('/:id', protect, requireAdmin, deleteUser);
router.put('/admin/:id', protect, requireAdmin, updateUser);

module.exports = router;