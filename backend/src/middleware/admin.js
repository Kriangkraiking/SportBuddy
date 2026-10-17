// ➕ เพิ่ม: guard สำหรับ endpoint ที่ต้องเป็นแอดมินเท่านั้น ต้องใช้ต่อจาก `protect` เสมอ
// (protect โหลด req.user ให้ก่อน ตัวนี้แค่เช็ค role) — ไม่มี endpoint ให้ self-promote เป็น admin
// ต้องตั้ง role เป็น 'admin' ผ่าน MongoDB โดยตรงเท่านั้น
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'ต้องเป็นแอดมินเท่านั้นถึงจะเข้าถึงส่วนนี้ได้' });
  }
  next();
};

module.exports = { requireAdmin };
