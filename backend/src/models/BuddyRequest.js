const mongoose = require('mongoose');

// Represents a "find a buddy" connection request between two users
const buddyRequestSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sport: { type: String, required: true },
    message: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  },
  { timestamps: true }
);

buddyRequestSchema.index({ from: 1, to: 1, sport: 1 }, { unique: true });

module.exports = mongoose.model('BuddyRequest', buddyRequestSchema);
