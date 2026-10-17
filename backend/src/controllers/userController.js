const User = require('../models/User');
// ➕ เพิ่ม: ใช้เช็คว่าผู้ที่สั่ง blacklist เป็น "ผู้จัด" ของกิจกรรมที่ผู้เล่นคนนั้นเข้าร่วมจริงหรือไม่
const Event = require('../models/Event');

// @desc  Update current user's profile
// @route PUT /api/users/me
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, sports, location } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (sports !== undefined) user.sports = sports;
    if (location !== undefined) {
      user.location = {
        type: 'Point',
        coordinates: location.coordinates || [0, 0],
        city: location.city || '',
        address: location.address || '',
      };
    }

    await user.save();
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

// @desc  Get a user's public profile by id
// @route GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

// @desc  Upload / replace the current user's profile picture
// @route POST /api/users/me/avatar
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all users for Admin Dashboard
// @route GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    res.status(200).json(users);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// ลบ user โดย admin
const deleteUser = async (req, res) => {
  try {
    // ใช้ req.params.id เพื่อดึง ID จาก URL และใช้คำสั่ง findByIdAndDelete
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้งานนี้ในระบบ' });
    }
    
    res.status(200).json({ message: 'ลบผู้ใช้งานสำเร็จ' });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลบผู้ใช้ฝั่ง Backend:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
//อัปเดท user โดย admin
// ✏️ แก้ไข: เดิมเรียก User.fineByIdAndDelete ซึ่งเป็นชื่อ method ที่ไม่มีอยู่จริงใน Mongoose (พิมพ์ผิด)
// ทำให้ endpoint นี้ error ทุกครั้งที่เรียก ต้องใช้ findByIdAndUpdate ถึงจะอัปเดตได้จริง
// ✏️ แก้ไข: เดิมรับ req.body ทั้งก้อนไปอัปเดตตรงๆ (แก้ field อะไรก็ได้ตามใจ) อันตรายมากถ้ามีคนส่ง
// password มาด้วย — findByIdAndUpdate ไม่ผ่าน pre('save') hook เลยจะได้รหัสผ่านเป็น plain text
// ตรงๆ (บั๊กเดียวกับตอนแก้ผ่าน MongoDB GUI ที่เคยเจอ) เลยจำกัดให้แก้ได้เฉพาะ field ที่ตั้งใจให้แก้เท่านั้น
const updateUser = async (req,res) => {
  try {
    const { name, email, role, bio } = req.body;

    if (role !== undefined) {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'role ต้องเป็น user หรือ admin เท่านั้น' });
      }
      // กันแอดมินลดสิทธิ์ตัวเองจนล็อกตัวเองออกจากเว็บแอดมินโดยไม่ตั้งใจ
      if (String(req.user._id) === String(req.params.id) && role !== 'admin') {
        return res.status(400).json({ message: 'ลดสิทธิ์ตัวเองไม่ได้ ให้แอดมินคนอื่นเป็นคนแก้แทน' });
      }
    }

    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = String(email).toLowerCase().trim();
    if (role !== undefined) update.role = role;
    if (bio !== undefined) update.bio = bio;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message :'ไม่พบผู้ใช้งานนี้ในระบบ'});
    }
    res.status(200).json(user);
  } catch(error) {
    console.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้",error);
    res.status(500).json({message : 'Server error'});
  }
};

// ➕ เพิ่ม: บล็อกผู้ใช้คนหนึ่ง (เช่น host บล็อกผู้เล่นที่มีพฤติกรรมไม่เหมาะสม) เป็นการบล็อกส่วนตัว
// ผลคือคนที่ถูกบล็อกเข้าร่วม event ในอนาคตของเราไม่ได้อีก (เช็คใน eventController.joinEvent)
// @desc  Block a user
// @route POST /api/users/:id/block
const blockUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (targetId === String(req.user._id)) {
      return res.status(400).json({ message: 'บล็อกตัวเองไม่ได้' });
    }

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'ไม่พบผู้ใช้ที่ต้องการบล็อก' });

    // ✏️ แก้ไข: เดิม user ทุกคนเรียก endpoint นี้บล็อกใครก็ได้ (กันแค่ที่ปุ่มในแอป) ตอนนี้บังคับที่ backend
    // ว่า blacklist ได้เฉพาะ "ผู้จัด" และต้องเป็นผู้เล่นที่เข้าร่วม/ขอเข้าร่วมกิจกรรมของตัวเองจริงๆ เท่านั้น
    const isHostOfTarget = await Event.exists({
      host: req.user._id,
      $or: [{ participants: targetId }, { pendingParticipants: targetId }],
    });
    if (!isHostOfTarget) {
      return res.status(403).json({
        message: 'เฉพาะผู้จัดกิจกรรมเท่านั้นที่แบล็คลิสต์ผู้เล่นได้ (ต้องเป็นผู้เล่นที่เข้าร่วมหรือขอเข้าร่วมกิจกรรมของคุณ)',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user.blockedUsers.some((id) => String(id) === targetId)) {
      user.blockedUsers.push(targetId);
      await user.save();
    }

    res.json({ blockedUsers: user.blockedUsers });
  } catch (err) {
    next(err);
  }
};

// @desc  Unblock a user
// @route DELETE /api/users/:id/block
const unblockUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const user = await User.findById(req.user._id);
    user.blockedUsers = user.blockedUsers.filter((id) => String(id) !== targetId);
    await user.save();

    res.json({ blockedUsers: user.blockedUsers });
  } catch (err) {
    next(err);
  }
};

// @desc  List users the current user has blocked
// @route GET /api/users/me/blocked
const listBlockedUsers = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('blockedUsers', 'name avatar');
    res.json({ blockedUsers: user.blockedUsers });
  } catch (err) {
    next(err);
  }
};

// รวมฟังก์ชันทั้งหมดไว้ในที่เดียว แอปมือถือใช้งานได้ปกติ และเว็บก็ดึงข้อมูลได้
module.exports = {
  updateProfile,
  getUserById,
  uploadAvatar,
  getAllUsers ,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  listBlockedUsers,
};