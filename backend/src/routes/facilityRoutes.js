const express = require('express');
const router = express.Router();
const {
  listFacilities,
  getFacility,
  createFacility,
  updateFacility,
  deleteFacility,
} = require('../controllers/facilityController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// ➕ เพิ่ม: Facility Management เป็นฟีเจอร์ฝั่งแอดมินอย่างเดียว ทุกเส้นทางเลยต้อง protect + requireAdmin
router.route('/').get(protect, requireAdmin, listFacilities).post(protect, requireAdmin, createFacility);
router
  .route('/:id')
  .get(protect, requireAdmin, getFacility)
  .put(protect, requireAdmin, updateFacility)
  .delete(protect, requireAdmin, deleteFacility);

module.exports = router;
