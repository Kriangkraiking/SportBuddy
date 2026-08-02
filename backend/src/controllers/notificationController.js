const Notification = require('../models/Notification');

// @desc  List the current user's notifications (newest first)
// @route GET /api/notifications
const listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate('fromUser', 'name avatar')
      .populate('event', 'title dateTime')
      .sort('-createdAt')
      .limit(100);

    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// @desc  Mark a single notification as read
// @route PUT /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.read = true;
    await notification.save();
    res.json({ notification });
  } catch (err) {
    next(err);
  }
};

// @desc  Mark all of the current user's notifications as read
// @route PUT /api/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ message: 'ok' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listNotifications, markAsRead, markAllAsRead };
