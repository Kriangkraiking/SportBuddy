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

module.exports = { updateProfile, getUserById, uploadAvatar };
