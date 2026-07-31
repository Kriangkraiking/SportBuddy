const Event = require('../models/Event');

// @desc  Create a new sport event/activity
// @route POST /api/events
const createEvent = async (req, res, next) => {
  try {
    const { title, sport, description, dateTime, location, maxParticipants, skillLevel } = req.body;

    if (!title || !sport || !dateTime) {
      return res.status(400).json({ message: 'title, sport, dateTime are required' });
    }

    const event = await Event.create({
      title,
      sport,
      description,
      host: req.user._id,
      participants: [req.user._id],
      maxParticipants,
      dateTime,
      skillLevel,
      location: location
        ? { type: 'Point', coordinates: location.coordinates || [0, 0], address: location.address || '' }
        : undefined,
    });

    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
};

// @desc  List events, optionally filtered by sport / nearby / upcoming
// @route GET /api/events?sport=Football&lng=..&lat=..&maxDistanceKm=..
const listEvents = async (req, res, next) => {
  try {
    const { sport, lng, lat, maxDistanceKm } = req.query;
    const query = { dateTime: { $gte: new Date() } };

    if (sport) query.sport = new RegExp(`^${sport}$`, 'i');

    if (lng && lat) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: (parseFloat(maxDistanceKm) || 20) * 1000,
        },
      };
    }

    const events = await Event.find(query)
      .populate('host', 'name avatar')
      .populate('participants', 'name avatar')
      .sort('dateTime')
      .limit(50);

    res.json({ events });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single event
// @route GET /api/events/:id
const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('host', 'name avatar')
      .populate('participants', 'name avatar');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (err) {
    next(err);
  }
};

// @desc  Join an event
// @route POST /api/events/:id/join
const joinEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.participants.some((p) => String(p) === String(req.user._id))) {
      return res.status(400).json({ message: 'Already joined' });
    }
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    event.participants.push(req.user._id);
    if (event.participants.length >= event.maxParticipants) {
      event.status = 'full';
    }
    await event.save();
    res.json({ event });
  } catch (err) {
    next(err);
  }
};

// @desc  Leave an event
// @route POST /api/events/:id/leave
const leaveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.participants = event.participants.filter((p) => String(p) !== String(req.user._id));
    event.status = 'open';
    await event.save();
    res.json({ event });
  } catch (err) {
    next(err);
  }
};

// @desc  Update an event (host only)
// @route PUT /api/events/:id
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (String(event.host) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the host can edit this event' });
    }

    const { title, sport, description, dateTime, location, maxParticipants, skillLevel } = req.body;

    if (title !== undefined) event.title = title;
    if (sport !== undefined) event.sport = sport;
    if (description !== undefined) event.description = description;
    if (dateTime !== undefined) event.dateTime = dateTime;
    if (maxParticipants !== undefined) event.maxParticipants = maxParticipants;
    if (skillLevel !== undefined) event.skillLevel = skillLevel;
    if (location !== undefined) {
      event.location = location
        ? { type: 'Point', coordinates: location.coordinates || [0, 0], address: location.address || '' }
        : undefined;
    }

    // Re-evaluate the full/open status in case maxParticipants changed
    event.status =
      event.status === 'cancelled' || event.status === 'completed'
        ? event.status
        : event.participants.length >= event.maxParticipants
        ? 'full'
        : 'open';

    await event.save();
    await event.populate('host', 'name avatar');
    await event.populate('participants', 'name avatar');
    res.json({ event });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete an event (host only)
// @route DELETE /api/events/:id
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (String(event.host) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the host can delete this event' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createEvent,
  listEvents,
  getEvent,
  joinEvent,
  leaveEvent,
  updateEvent,
  deleteEvent,
};
