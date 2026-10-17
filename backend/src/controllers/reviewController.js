const Event = require('../models/Event');
const Review = require('../models/Review');
const { notifyReviewReceived } = require('../utils/notification');

// ➕ เพิ่ม: ระบบรีวิวหลังกิจกรรมจบ — ผู้จัดรีวิวได้เฉพาะผู้เล่นที่เข้าร่วม
// ผู้เล่นรีวิวได้เฉพาะผู้จัด ไม่มีรีวิวข้ามระหว่างผู้เล่นด้วยกันเอง (ตาม workflow ที่ตกลงกันไว้)
const isInvolvedInEvent = (event, userId) =>
  String(event.host) === String(userId) || event.participants.some((p) => String(p) === String(userId));

// @desc  Review someone you played with in a completed event
// @route POST /api/events/:id/reviews  body: { to, rating, comment }
const createReview = async (req, res, next) => {
  try {
    const { to, rating, comment } = req.body;
    if (!to || !rating) {
      return res.status(400).json({ message: 'to และ rating ต้องระบุให้ครบ' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating ต้องอยู่ระหว่าง 1-5' });
    }
    if (to === String(req.user._id)) {
      return res.status(400).json({ message: 'รีวิวตัวเองไม่ได้' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status !== 'completed') {
      return res.status(400).json({ message: 'รีวิวได้เมื่อกิจกรรมจบแล้วเท่านั้น' });
    }
    if (!isInvolvedInEvent(event, req.user._id)) {
      return res.status(403).json({ message: 'คุณไม่ได้เข้าร่วมกิจกรรมนี้' });
    }

    const isHost = String(event.host) === String(req.user._id);
    const targetIsParticipant = event.participants.some((p) => String(p) === String(to));
    const targetIsHost = String(event.host) === String(to);

    if (isHost && !targetIsParticipant) {
      return res.status(400).json({ message: 'ผู้จัดรีวิวได้เฉพาะผู้เล่นที่เข้าร่วมกิจกรรมนี้เท่านั้น' });
    }
    if (!isHost && !targetIsHost) {
      return res.status(400).json({ message: 'รีวิวได้เฉพาะผู้จัดกิจกรรมนี้เท่านั้น' });
    }

    const review = await Review.create({
      event: event._id,
      from: req.user._id,
      to,
      rating,
      comment: comment || '',
    });
    await review.populate('from', 'name avatar');

    notifyReviewReceived(to, req.user, event);

    res.status(201).json({ review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'คุณรีวิวคนนี้สำหรับกิจกรรมนี้ไปแล้ว' });
    }
    next(err);
  }
};

// @desc  List reviews left inside one event (both directions)
// @route GET /api/events/:id/reviews
const listEventReviews = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const reviews = await Review.find({ event: event._id })
      .populate('from', 'name avatar')
      .populate('to', 'name avatar')
      .sort('-createdAt');

    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

// @desc  List reviews a user has received, plus their average rating
// @route GET /api/users/:id/reviews
const listUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ to: req.params.id })
      .populate('from', 'name avatar')
      .populate('event', 'title sport')
      .sort('-createdAt');

    const averageRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

    res.json({ reviews, averageRating, count: reviews.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, listEventReviews, listUserReviews };
