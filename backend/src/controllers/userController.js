const User = require('../models/User');

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
const updateUser = async (req,res) => {
  try {
    const user = await User.fineByIdAndDelete(req.params.id,req.body,{new:true});
    if (!user) {
      return res.status(404).json({ message :'ไม่พบผู้ใช้งานนี้ในระบบ'});
    }
    res.status(200).json(user);
  } catch(error) {
    console.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้",error);
    res.status(500).json({message : 'Server error'});
  }
};

// รวมฟังก์ชันทั้งหมดไว้ในที่เดียว แอปมือถือใช้งานได้ปกติ และเว็บก็ดึงข้อมูลได้
module.exports = { 
  updateProfile, 
  getUserById, 
  uploadAvatar, 
  getAllUsers ,
  deleteUser,
  updateUser
};