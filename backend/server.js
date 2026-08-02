require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const buddyRoutes = require('./src/routes/buddyRoutes');
const matchRoutes = require('./src/routes/matchRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const { startEventReminderJob } = require('./src/jobs/eventReminderJob');

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files (profile pictures, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SportBuddy API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/buddies', buddyRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`SportBuddy API running on port ${PORT}`);
  });
  startEventReminderJob();
});

module.exports = app;
