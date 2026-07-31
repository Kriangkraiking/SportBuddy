const Message = require('../models/Message');
const Event = require('../models/Event');

const canAccessEventChat = (event, userId) => {
  if (String(event.host) === String(userId)) return true;
  return event.participants.some((p) => String(p) === String(userId));
};

// @desc  List the messages posted in an event's party chat
// @route GET /api/events/:id/messages
const listMessages = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!canAccessEventChat(event, req.user._id)) {
      return res.status(403).json({ message: 'Join this match to view its chat' });
    }

    const messages = await Message.find({ event: event._id })
      .populate('sender', 'name avatar')
      .sort('createdAt')
      .limit(200);

    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

// @desc  Post a new message in an event's party chat
// @route POST /api/events/:id/messages
const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'text is required' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!canAccessEventChat(event, req.user._id)) {
      return res.status(403).json({ message: 'Join this match to send messages' });
    }

    const message = await Message.create({
      event: event._id,
      sender: req.user._id,
      text: text.trim(),
    });
    await message.populate('sender', 'name avatar');

    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};

module.exports = { listMessages, sendMessage };
