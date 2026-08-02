const Event = require('../models/Event');
const { notifyEventReminder } = require('../utils/notification');

// How far ahead of an event's start time we send the "starting soon" ping.
const REMINDER_WINDOW_MINUTES = 60;
// How often we check for events entering that window.
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

// Looks for open events starting within the reminder window that haven't
// been reminded about yet, and notifies the host + every joined participant.
const checkUpcomingEvents = async () => {
  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MINUTES * 60 * 1000);

    const events = await Event.find({
      dateTime: { $gte: now, $lte: windowEnd },
      reminderSent: false,
      status: { $in: ['open', 'full'] },
    });

    for (const event of events) {
      const minutesUntil = Math.max(1, Math.round((event.dateTime.getTime() - now.getTime()) / 60000));
      const recipients = new Set([String(event.host), ...event.participants.map(String)]);

      // eslint-disable-next-line no-await-in-loop
      await Promise.all([...recipients].map((userId) => notifyEventReminder(userId, event, minutesUntil)));

      event.reminderSent = true;
      // eslint-disable-next-line no-await-in-loop
      await event.save();
    }
  } catch (err) {
    console.error('Event reminder check failed:', err.message);
  }
};

// Runs once immediately, then on a fixed interval for as long as the server
// process is alive.
const startEventReminderJob = () => {
  checkUpcomingEvents();
  setInterval(checkUpcomingEvents, CHECK_INTERVAL_MS);
};

module.exports = { startEventReminderJob, checkUpcomingEvents };
