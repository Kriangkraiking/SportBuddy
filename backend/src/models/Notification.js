const mongoose = require('mongoose');

// A single in-app notification for a user — e.g. "someone added you as a
// friend" or "your match starts soon".
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['friend_request', 'friend_accepted', 'event_joined', 'event_reminder'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
