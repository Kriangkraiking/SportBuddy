const Event = require('../models/Event');
const User = require('../models/User');

// @desc  Find the best matching events and buddies for a given sport,
//        skill level and preferred date/time.
// @route GET /api/match?sport=Badminton&skillLevel=intermediate&dateTime=2026-08-01T18:00:00.000Z
const matchSportPartners = async (req, res, next) => {
  try {
    const { sport, skillLevel, dateTime } = req.query;

    if (!sport) {
      return res.status(400).json({ message: 'sport is required' });
    }

    const targetDate = dateTime ? new Date(dateTime) : new Date();
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: 'dateTime is invalid' });
    }
    const sportRegex = new RegExp(`^${sport.trim()}$`, 'i');
    const normalizedLevel = skillLevel && skillLevel !== 'all' ? skillLevel : null;

    // ---- Match events: same sport, compatible skill level, closest to the requested time ----
    const eventQuery = {
      sport: sportRegex,
      status: { $in: ['open', 'full'] },
      dateTime: { $gte: new Date() },
    };
    if (normalizedLevel) {
      eventQuery.skillLevel = { $in: [normalizedLevel, 'all'] };
    }

    const candidateEvents = await Event.find(eventQuery)
      .populate('host', 'name avatar')
      .populate('participants', 'name avatar')
      .limit(50);

    const events = candidateEvents
      .map((event) => ({
        event,
        diffMs: Math.abs(new Date(event.dateTime).getTime() - targetDate.getTime()),
      }))
      .sort((a, b) => a.diffMs - b.diffMs)
      .slice(0, 10)
      .map(({ event, diffMs }) => ({
        ...event.toObject(),
        matchScore: Math.max(0, 100 - Math.round(diffMs / (60 * 60 * 1000)) * 5), // rough score, decays ~5pts/hour away
      }));

    // ---- Match buddies: same sport, prefer matching skill level ----
    const candidateBuddies = await User.find({
      _id: { $ne: req.user._id },
      'sports.name': sportRegex,
    }).limit(50);

    const buddies = candidateBuddies
      .map((user) => {
        const sportEntry = user.sports.find((s) => sportRegex.test(s.name));
        const levelMatch = !normalizedLevel || sportEntry?.level === normalizedLevel;
        return { user, levelMatch };
      })
      .sort((a, b) => Number(b.levelMatch) - Number(a.levelMatch))
      .slice(0, 10)
      .map(({ user, levelMatch }) => ({ ...user.toPublicJSON(), levelMatch }));

    res.json({
      criteria: { sport: sport.trim(), skillLevel: normalizedLevel || 'all', dateTime: targetDate },
      events,
      buddies,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { matchSportPartners };
