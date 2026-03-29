const express = require('express');
const cors = require('cors');
const eventTypesRoutes = require('./routes/eventTypes');
const availabilityRoutes = require('./routes/availability');
const bookingsRoutes = require('./routes/bookings');
const publicRoutes = require('./routes/public');
const dateOverrideRoutes = require('./routes/dateOverrides');
const scheduleRoutes = require('./routes/schedules');
const errorHandler = require('./middleware/errorHandler');
const db = require('./db');

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Current user endpoint (no auth — returns default user)
app.get('/api/me', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT id, username, name, email, timezone FROM users WHERE id = 1');
    if (!rows[0]) return res.status(404).json({ error: 'Default user not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// API routes
app.use('/api/event-types', eventTypesRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/date-overrides', dateOverrideRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/public', publicRoutes);

app.use(errorHandler);

module.exports = app;
