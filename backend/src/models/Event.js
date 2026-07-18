const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    sport: { type: String, required: true },
    description: { type: String, default: '' },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxParticipants: { type: Number, default: 10 },
    dateTime: { type: Date, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
      address: { type: String, default: '' },
    },
    skillLevel: { type: String, enum: ['all', 'beginner', 'intermediate', 'advanced'], default: 'all' },
    status: { type: String, enum: ['open', 'full', 'cancelled', 'completed'], default: 'open' },
  },
  { timestamps: true }
);

eventSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Event', eventSchema);
