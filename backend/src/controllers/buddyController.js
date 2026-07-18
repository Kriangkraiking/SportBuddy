const User = require('../models/User');
const BuddyRequest = require('../models/BuddyRequest');

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

// @desc  Send a buddy request
// @route POST /api/buddies/request
const sendRequest = async (req, res, next) => {
  try {
    const { to, sport, message } = req.body;
    if (!to || !sport) {
      return res.status(400).json({ message: 'to and sport are required' });
    }
    if (to === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot send a request to yourself' });
    }

    const request = await BuddyRequest.create({
      from: req.user._id,
      to,
      sport,
      message,
    });

    res.status(201).json({ request });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Request already sent for this sport' });
    }
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

module.exports = { searchBuddies, sendRequest, respondToRequest, listRequests };
