const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ➕ เพิ่ม: บังคับใช้กฎเดียวกับฝั่งมือถือไว้ที่ backend ด้วย เผื่อมีการเรียก API
// ตรงๆ โดยข้ามหน้าจอสมัครสมาชิก (client-side validation อย่างเดียวไม่ปลอดภัยพอ)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc  Register new user
// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, sports } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password are required' });
    }
    if (!EMAIL_REGEX.test(String(email).trim())) {
      return res.status(400).json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, sports });

    res.status(201).json({
      user: user.toPublicJSON(),
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Login
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      user: user.toPublicJSON(),
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Get current logged-in user
// @route GET /api/auth/me
const me = async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
};

module.exports = { register, login, me };
