const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Characters chosen to avoid visual ambiguity when users read/share a UID
// out loud or copy it by hand (no 0/O or 1/I).
const UID_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const randomUidCandidate = (length = 7) => {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += UID_CHARSET[Math.floor(Math.random() * UID_CHARSET.length)];
  }
  return code;
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    // Short, shareable public ID used to find and add a specific person as a
    // friend (distinct from the internal Mongo _id).
    uid: { type: String, unique: true, sparse: true, uppercase: true, trim: true, index: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 300 },
    sports: [
      {
        name: { type: String, required: true }, // e.g. "Badminton", "Running"
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'pro'],
          default: 'beginner',
        },
      },
    ],
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      city: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    // ➕ เพิ่ม: รายชื่อคนที่ผู้ใช้คนนี้บล็อกไว้ (เช่น host บล็อกผู้เล่นที่มีพฤติกรรมไม่เหมาะสม)
    // ผลคือคนที่ถูกบล็อกเข้าร่วม event ในอนาคตของ host คนนี้ไม่ได้อีก — เป็นการบล็อกส่วนตัว ไม่เกี่ยวกับระบบแอดมิน
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // ➕ เพิ่ม: บทบาทผู้ใช้ — ต้องเป็น 'admin' เท่านั้นถึงจะเข้าเว็บแอดมินได้ (ดู middleware/admin.js)
    // ไม่มี endpoint ให้ self-promote เป็น admin ได้ ต้องตั้งเองผ่าน MongoDB โดยตรงเท่านั้น
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

// Generates a UID that isn't already taken, retrying a few times in the
// unlikely event of a collision. Called both for brand-new users and, as a
// one-time backfill, for older accounts created before UIDs existed.
userSchema.statics.generateUniqueUid = async function generateUniqueUid() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = randomUidCandidate();
    // eslint-disable-next-line no-await-in-loop
    const exists = await this.exists({ uid: candidate });
    if (!exists) return candidate;
  }
  throw new Error('Could not generate a unique UID, please try again');
};

userSchema.pre('save', async function (next) {
  if (this.isNew && !this.uid) {
    this.uid = await this.constructor.generateUniqueUid();
  }
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    uid: this.uid,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    sports: this.sports,
    location: this.location,
    // ➕ เพิ่ม: ต้องส่ง role กลับไปด้วย ไม่งั้นฝั่งเว็บแอดมินไม่รู้ว่า user ที่ login เป็นแอดมินหรือเปล่า
    role: this.role,
  };
};

module.exports = mongoose.model('User', userSchema);
