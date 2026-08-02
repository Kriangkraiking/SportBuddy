const User = require('../models/User');
const BuddyRequest = require('../models/BuddyRequest');
const { notifyFriendRequest, notifyFriendAccepted } = require('../utils/notification');

// @desc  Find nearby buddies, optionally filtered by sport
// @route GET /api/buddies/search?sport=Running&lng=100.5&lat=13.7&maxDistanceKm=10
const searchBuddies = async (req, res, next) => {
  try {
    const { sport, lng, lat, maxDistanceKm } = req.query;

    const query = { _id: { $ne: req.user._id } };
    if (sport) {
      query['sports.name'] = new RegExp(`^${sport}$`, 'i');
    }

    if (lng && lat) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: (parseFloat(maxDistanceKm) || 20) * 1000,
        },
      };
    }

    const buddies = await User.find(query).limit(50);
    res.json({ buddies: buddies.map((u) => u.toPublicJSON()) });
  } catch (err) {
    next(err);
  }
};

// @desc  Send a buddy request. `sport` is optional — omit it (e.g. when
//        adding someone found via UID search) for a plain friend request.
// @route POST /api/buddies/request
const sendRequest = async (req, res, next) => {
  try {
    const { to, sport, message } = req.body;
    if (!to) {
      return res.status(400).json({ message: 'to is required' });
    }
    if (to === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot send a request to yourself' });
    }

    const request = await BuddyRequest.create({
      from: req.user._id,
      to,
      sport: sport || 'general',
      message,
    });

    notifyFriendRequest(to, req.user);

    res.status(201).json({ request });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'ส่งคำขอเป็นเพื่อนไปแล้ว' });
    }
    next(err);
  }
};

// @desc  Find a user by their shareable UID, to add as a friend
// @route GET /api/buddies/uid/:uid
const findByUid = async (req, res, next) => {
  try {
    const uid = String(req.params.uid || '').trim().toUpperCase();
    if (!uid) return res.status(400).json({ message: 'uid is required' });

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้ที่มี UID นี้' });
    }
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'นี่คือ UID ของคุณเอง' });
    }

    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

// @desc  Respond to a buddy request (accept/decline)
// @route PUT /api/buddies/request/:id
const respondToRequest = async (req, res, next) => {
  try {
    const { status } = req.body; // 'accepted' | 'declined'
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'status must be accepted or declined' });
    }

    const request = await BuddyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (String(request.to) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    request.status = status;
    await request.save();

    if (status === 'accepted') {
      notifyFriendAccepted(request.from, req.user);
    }

    res.json({ request });
  } catch (err) {
    next(err);
  }
};

// @desc  List requests involving the current user (incoming + outgoing)
// @route GET /api/buddies/requests
const listRequests = async (req, res, next) => {
  try {
    const requests = await BuddyRequest.find({
      $or: [{ from: req.user._id }, { to: req.user._id }],
    })
      .populate('from', 'name avatar')
      .populate('to', 'name avatar')
      .sort('-createdAt');

    res.json({ requests });
  } catch (err) {
    next(err);
  }
};

// @desc  List the current user's friends (accepted buddy requests, deduplicated
//        by counterpart — accepting a request in any sport makes you friends)
// @route GET /api/buddies/friends
const listFriends = async (req, res, next) => {
  try {
    const accepted = await BuddyRequest.find({
      status: 'accepted',
      $or: [{ from: req.user._id }, { to: req.user._id }],
    })
      .populate('from', 'name avatar bio sports')
      .populate('to', 'name avatar bio sports')
      .sort('-updatedAt');

    const seen = new Set();
    const friends = [];
    for (const request of accepted) {
      const counterpart = String(request.from._id) === String(req.user._id) ? request.to : request.from;
      const id = String(counterpart._id);
      if (seen.has(id)) continue;
      seen.add(id);
      friends.push(counterpart.toPublicJSON());
    }

    res.json({ friends });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchBuddies, sendRequest, respondToRequest, listRequests, listFriends, findByUid };
