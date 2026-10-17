const Event = require('../models/Event');
const User = require('../models/User');
// ✏️ แก้ไข: join ต้องรอ host อนุมัติแล้ว เปลี่ยนมาใช้ notifyEventJoinRequested/notifyEventJoinApproved แทน
const { notifyEventJoinRequested, notifyEventJoinApproved } = require('../utils/notification');

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
      .populate('participants', 'name avatar')
      // ➕ เพิ่ม: host ต้องเห็นรายชื่อคนที่รออนุมัติอยู่ด้วย ถึงจะกดอนุมัติ/ปฏิเสธได้จากหน้ารายละเอียดกิจกรรม
      .populate('pendingParticipants', 'name avatar');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (err) {
    next(err);
  }
};

// ✏️ แก้ไข: เดิม join แล้วเข้าร่วมทันที ตอนนี้ต้องรอ host กดอนุมัติก่อน — join แค่ย้ายไปคิว pendingParticipants
// ไม่กระทบ maxParticipants จนกว่าจะถูกอนุมัติจริง (ดู approveJoinRequest ด้านล่าง)
// @desc  Request to join an event (waits for host approval)
// @route POST /api/events/:id/join
const joinEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (String(event.host) === String(req.user._id)) {
      return res.status(400).json({ message: 'คุณเป็นเจ้าของกิจกรรมนี้อยู่แล้ว' });
    }
    if (event.participants.some((p) => String(p) === String(req.user._id))) {
      return res.status(400).json({ message: 'เข้าร่วมกิจกรรมนี้อยู่แล้ว' });
    }
    if (event.pendingParticipants.some((p) => String(p) === String(req.user._id))) {
      return res.status(400).json({ message: 'ส่งคำขอเข้าร่วมไปแล้ว รอผู้จัดอนุมัติ' });
    }
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // ➕ เพิ่ม: ถ้าเจ้าของกิจกรรมเคยบล็อกเราไว้ (ระบบบล็อกส่วนตัว) เข้าร่วมกิจกรรมของเขาไม่ได้อีก
    const host = await User.findById(event.host).select('blockedUsers');
    if (host?.blockedUsers.some((id) => String(id) === String(req.user._id))) {
      return res.status(403).json({ message: 'คุณถูกเจ้าของกิจกรรมนี้บล็อกไว้ ไม่สามารถเข้าร่วมได้' });
    }

    event.pendingParticipants.push(req.user._id);
    await event.save();

    // Fire-and-forget: let the host know someone wants to join their match.
    notifyEventJoinRequested(event.host, req.user, event);

    res.json({ event });
  } catch (err) {
    next(err);
  }
};

// ✏️ แก้ไข: รองรับทั้ง "ยกเลิกคำขอที่ยังรออนุมัติ" (ยังอยู่แค่ pendingParticipants) และ
// "ออกจากกิจกรรมที่เข้าร่วมแล้วจริง" (อยู่ใน participants) — ใช้ปุ่มเดียวกันในแอปได้เลย
// @desc  Leave an event, or cancel a pending join request
// @route POST /api/events/:id/leave
const leaveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.pendingParticipants = event.pendingParticipants.filter((p) => String(p) !== String(req.user._id));
    event.participants = event.participants.filter((p) => String(p) !== String(req.user._id));
    if (event.status !== 'cancelled' && event.status !== 'completed') {
      event.status = 'open';
    }
    await event.save();
    res.json({ event });
  } catch (err) {
    next(err);
  }
};

// ➕ เพิ่ม: host อนุมัติคำขอเข้าร่วม — ย้ายจาก pendingParticipants ไป participants จริง แล้วแจ้งเตือนผู้เล่น
// @desc  Approve a pending join request (host only)
// @route POST /api/events/:id/approve/:userId
const approveJoinRequest = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (String(event.host) !== String(req.user._id)) {
      return res.status(403).json({ message: 'เฉพาะเจ้าของกิจกรรมเท่านั้นที่อนุมัติคำขอเข้าร่วมได้' });
    }

    const { userId } = req.params;
    if (!event.pendingParticipants.some((p) => String(p) === userId)) {
      return res.status(404).json({ message: 'ไม่พบคำขอเข้าร่วมนี้ (อาจถูกยกเลิกไปแล้ว)' });
    }
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'กิจกรรมเต็มแล้ว ไม่สามารถอนุมัติเพิ่มได้' });
    }

    event.pendingParticipants = event.pendingParticipants.filter((p) => String(p) !== userId);
    event.participants.push(userId);
    if (event.participants.length >= event.maxParticipants) {
      event.status = 'full';
    }
    await event.save();
    await event.populate('host', 'name avatar');
    await event.populate('participants', 'name avatar');
    await event.populate('pendingParticipants', 'name avatar');

    // Fire-and-forget: let the player know they're approved.
    notifyEventJoinApproved(userId, req.user, event);

    res.json({ event });
  } catch (err) {
    next(err);
  }
};

// ➕ เพิ่ม: host ปฏิเสธคำขอเข้าร่วม — ไม่แจ้งเตือนผู้เล่น (เหมือน pattern เดิมของ BuddyRequest ที่แจ้งแค่ตอน accept)
// @desc  Decline a pending join request (host only)
// @route POST /api/events/:id/decline/:userId
const declineJoinRequest = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (String(event.host) !== String(req.user._id)) {
      return res.status(403).json({ message: 'เฉพาะเจ้าของกิจกรรมเท่านั้นที่ปฏิเสธคำขอเข้าร่วมได้' });
    }

    const { userId } = req.params;
    event.pendingParticipants = event.pendingParticipants.filter((p) => String(p) !== userId);
    await event.save();
    await event.populate('host', 'name avatar');
    await event.populate('participants', 'name avatar');
    await event.populate('pendingParticipants', 'name avatar');

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
    if (dateTime !== undefined) {
      event.dateTime = dateTime;
      // A new start time means the old reminder is no longer valid — allow
      // the reminder job to send a fresh one for the rescheduled time.
      event.reminderSent = false;
    }
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

// ➕ เพิ่ม: จบกิจกรรม (host กดเอง) ปลดล็อกให้ผู้จัด/ผู้เข้าร่วมรีวิวกันได้ (ดู reviewController)
// @desc  Mark an event as completed (host only)
// @route POST /api/events/:id/complete
const completeEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (String(event.host) !== String(req.user._id)) {
      return res.status(403).json({ message: 'เฉพาะเจ้าของกิจกรรมเท่านั้นที่จบกิจกรรมได้' });
    }
    if (event.status === 'cancelled') {
      return res.status(400).json({ message: 'กิจกรรมนี้ถูกยกเลิกไปแล้ว' });
    }

    event.status = 'completed';
    // ✏️ แก้ไข: บันทึกเวลาจบกิจกรรมไว้ ให้ eventCleanupJob นับ 5 นาทีจากจุดนี้แล้วลบกิจกรรมทิ้งจริง
    event.completedAt = new Date();
    await event.save();
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
  approveJoinRequest,
  declineJoinRequest,
  updateEvent,
  completeEvent,
  deleteEvent,
};
