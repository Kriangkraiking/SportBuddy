const Event = require('../models/Event');
const User = require('../models/User');
// ➕ เพิ่ม: โมเดล/ยูทิลสำหรับระบบปัดหาคู่กีฬาแบบ Tinder
const Swipe = require('../models/Swipe');
const BuddyRequest = require('../models/BuddyRequest');
const { notifyBuddyMatched } = require('../utils/notification');

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

// ➕ เพิ่ม: ดึงรายชื่อผู้เล่นให้ "ปัด" ตามชนิดกีฬา ไม่เอาคนที่เคยปัดไปแล้ว (ทุกทิศทาง) มาโชว์ซ้ำ
// @route GET /api/match/candidates?sport=Badminton&skillLevel=intermediate
const getMatchCandidates = async (req, res, next) => {
  try {
    const { sport, skillLevel } = req.query;
    if (!sport) {
      return res.status(400).json({ message: 'sport is required' });
    }
    const sportRegex = new RegExp(`^${sport.trim()}$`, 'i');
    const normalizedLevel = skillLevel && skillLevel !== 'all' ? skillLevel : null;

    const alreadySwiped = await Swipe.find({ from: req.user._id, sport: sport.trim() }).distinct('to');

    const candidateUsers = await User.find({
      _id: { $ne: req.user._id, $nin: alreadySwiped },
      'sports.name': sportRegex,
    }).limit(30);

    const candidates = candidateUsers
      .map((user) => {
        const sportEntry = user.sports.find((s) => sportRegex.test(s.name));
        const levelMatch = !normalizedLevel || sportEntry?.level === normalizedLevel;
        return { user, levelMatch };
      })
      .sort((a, b) => Number(b.levelMatch) - Number(a.levelMatch))
      .map(({ user, levelMatch }) => ({ ...user.toPublicJSON(), levelMatch }));

    res.json({ candidates });
  } catch (err) {
    next(err);
  }
};

// ➕ เพิ่ม: บันทึกผลการปัดซ้าย/ขวา ถ้าปัดขวาแล้วอีกฝ่ายเคยปัดขวาให้เราไว้ก่อน (mutual)
// ให้สร้าง/อัปเดต BuddyRequest เป็น accepted ทันที แล้วแจ้งเตือนทั้งสองฝ่ายผ่าน notifyBuddyMatched
// @route POST /api/match/swipe  body: { to, sport, direction }
const swipeMatch = async (req, res, next) => {
  try {
    const { to, sport, direction } = req.body;
    if (!to || !sport || !['left', 'right'].includes(direction)) {
      return res.status(400).json({ message: 'to, sport และ direction (left/right) ต้องระบุให้ครบ' });
    }
    if (to === String(req.user._id)) {
      return res.status(400).json({ message: 'ปัดหาตัวเองไม่ได้' });
    }

    await Swipe.findOneAndUpdate(
      { from: req.user._id, to, sport },
      { direction },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (direction !== 'right') {
      return res.json({ matched: false });
    }

    const reciprocal = await Swipe.findOne({ from: to, to: req.user._id, sport, direction: 'right' });
    if (!reciprocal) {
      return res.json({ matched: false });
    }

    let request = await BuddyRequest.findOne({
      sport,
      $or: [
        { from: req.user._id, to },
        { from: to, to: req.user._id },
      ],
    });

    if (request) {
      if (request.status !== 'accepted') {
        request.status = 'accepted';
        await request.save();
      }
    } else {
      request = await BuddyRequest.create({ from: req.user._id, to, sport, status: 'accepted' });
    }

    const otherUser = await User.findById(to);
    notifyBuddyMatched(to, req.user, sport);
    notifyBuddyMatched(req.user._id, otherUser, sport);

    res.json({ matched: true, user: otherUser?.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

module.exports = { matchSportPartners, getMatchCandidates, swipeMatch };
