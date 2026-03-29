const Booking = require('../models/booking');
const EventType = require('../models/eventType');
const Availability = require('../models/availability');
const DateOverride = require('../models/dateOverride');
const Schedule = require('../models/schedule');
const { generateSlots } = require('../utils/slotGenerator');
const emailService = require('../utils/emailService');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const db = require('../db');

dayjs.extend(utc);
dayjs.extend(timezone);

const bookingController = {
  async list(req, res, next) {
    try {
      const { status } = req.query;
      const bookings = status === 'past' ? await Booking.findPast() : await Booking.findUpcoming();
      res.json(bookings);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const booking = await Booking.findById(id);
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      res.json(booking);
    } catch (err) {
      next(err);
    }
  },

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      // Fetch full booking details before cancelling (for email)
      const fullBooking = await Booking.findById(id);
      const booking = await Booking.cancel(id);
      if (!booking) return res.status(404).json({ error: 'Booking not found or already cancelled' });

      // Send cancellation email (fire-and-forget)
      if (fullBooking) {
        const eventType = await EventType.findById(fullBooking.event_type_id);
        const { rows: users } = await db.query('SELECT * FROM users WHERE id = $1', [eventType.user_id]);
        if (eventType && users[0]) {
          emailService.sendBookingCancellation({
            booking: fullBooking,
            eventType,
            hostUser: users[0],
          }).catch(err => console.error('Email error:', err.message));
        }
      }

      res.json(booking);
    } catch (err) {
      next(err);
    }
  },

  async reschedule(req, res, next) {
    try {
      const { id } = req.params;
      const { start_time, timezone: bookerTimezone } = req.body;

      // Get the old booking to copy details
      const oldBooking = await Booking.findById(id);
      if (!oldBooking) return res.status(404).json({ error: 'Booking not found' });
      if (oldBooking.status !== 'confirmed') return res.status(400).json({ error: 'Only confirmed bookings can be rescheduled' });

      const startDt = dayjs(start_time).utc();
      const endDt = startDt.add(oldBooking.duration, 'minute');

      const newBooking = await Booking.reschedule(id, {
        event_type_id: oldBooking.event_type_id,
        booker_name: oldBooking.booker_name,
        booker_email: oldBooking.booker_email,
        start_time: startDt.toISOString(),
        end_time: endDt.toISOString(),
        booker_timezone: bookerTimezone || oldBooking.booker_timezone,
        answers: oldBooking.answers || [],
      });

      // Send reschedule email (fire-and-forget)
      const eventType = await EventType.findById(oldBooking.event_type_id);
      const { rows: users } = await db.query('SELECT * FROM users WHERE id = $1', [eventType.user_id]);
      if (eventType && users[0]) {
        emailService.sendBookingReschedule({
          oldBooking,
          newBooking,
          eventType,
          hostUser: users[0],
        }).catch(err => console.error('Email error:', err.message));
      }

      res.json(newBooking);
    } catch (err) {
      if (err.code === '23P01') {
        return res.status(409).json({ error: 'This time slot is no longer available' });
      }
      next(err);
    }
  },

  // Public routes
  async getEventInfo(req, res, next) {
    try {
      const { username, slug } = req.params;
      const { rows } = await db.query('SELECT id FROM users WHERE username = $1', [username]);
      if (!rows[0]) return res.status(404).json({ error: 'User not found' });

      const eventType = await EventType.findBySlug(rows[0].id, slug);
      if (!eventType) return res.status(404).json({ error: 'Event type not found' });

      res.json({
        id: eventType.id,
        title: eventType.title,
        description: eventType.description,
        duration: eventType.duration,
        buffer_time: eventType.buffer_time,
        username: eventType.username,
        user_name: eventType.user_name,
        user_timezone: eventType.user_timezone,
        slug: eventType.slug,
        custom_questions: eventType.custom_questions || [],
      });
    } catch (err) {
      next(err);
    }
  },

  async getSlots(req, res, next) {
    try {
      const { username, slug } = req.params;
      const { date, timezone: bookerTimezone } = req.query;

      if (!date) return res.status(400).json({ error: 'Date is required' });
      const tz = bookerTimezone || 'Asia/Kolkata';

      // Get user
      const { rows: users } = await db.query('SELECT * FROM users WHERE username = $1', [username]);
      if (!users[0]) return res.status(404).json({ error: 'User not found' });
      const user = users[0];

      // Get event type
      const eventType = await EventType.findBySlug(user.id, slug);
      if (!eventType || !eventType.is_active) {
        return res.status(404).json({ error: 'Event type not found or inactive' });
      }

      // Check for date override first
      const override = await DateOverride.findByDate(user.id, date);
      if (override && override.is_blocked) {
        return res.json({ date, slots: [] });
      }

      // Get day of week for the requested date
      const dayOfWeek = dayjs(date).day();

      // Get availability — use override hours if set, otherwise weekly schedule
      let availability;
      if (override && !override.is_blocked) {
        availability = { start_time: override.start_time, end_time: override.end_time };
      } else {
        // Resolve schedule: event type specific or user's default
        if (eventType.schedule_id) {
          const schedule = await Schedule.findById(eventType.schedule_id);
          if (schedule) {
            const dayAvail = schedule.availability.find(a => a.day_of_week === dayOfWeek && a.is_active);
            availability = dayAvail || null;
          } else {
            availability = await Availability.findByDayForUser(user.id, dayOfWeek);
          }
        } else {
          availability = await Availability.findByDayForUser(user.id, dayOfWeek);
        }
      }

      // Get existing bookings for that day (full day range in UTC)
      const startOfDay = dayjs.tz(date, user.timezone).startOf('day').utc().toISOString();
      const endOfDay = dayjs.tz(date, user.timezone).endOf('day').utc().toISOString();
      const existingBookings = await Booking.findByUserAndDateRange(user.id, startOfDay, endOfDay);

      const slots = generateSlots(
        date,
        eventType.duration,
        eventType.buffer_time || 0,
        availability,
        existingBookings,
        user.timezone,
        tz
      );

      res.json({ date, slots });
    } catch (err) {
      next(err);
    }
  },

  async book(req, res, next) {
    try {
      const { username, slug } = req.params;
      const { name, email, start_time, timezone: bookerTimezone, answers } = req.body;

      // Get user & event type
      const { rows: users } = await db.query('SELECT * FROM users WHERE username = $1', [username]);
      if (!users[0]) return res.status(404).json({ error: 'User not found' });

      const eventType = await EventType.findBySlug(users[0].id, slug);
      if (!eventType || !eventType.is_active) {
        return res.status(404).json({ error: 'Event type not found or inactive' });
      }

      // Validate required custom questions
      const questions = eventType.custom_questions || [];
      const requiredQuestions = questions.filter(q => q.required);
      for (const rq of requiredQuestions) {
        const answer = (answers || []).find(a => a.question === rq.label);
        if (!answer || !answer.answer.trim()) {
          return res.status(400).json({ error: `"${rq.label}" is required` });
        }
      }

      const startDt = dayjs(start_time).utc();
      const endDt = startDt.add(eventType.duration, 'minute');

      const booking = await Booking.create({
        event_type_id: eventType.id,
        booker_name: name,
        booker_email: email,
        start_time: startDt.toISOString(),
        end_time: endDt.toISOString(),
        booker_timezone: bookerTimezone || 'Asia/Kolkata',
        answers: answers || [],
      });

      // Send confirmation email (fire-and-forget)
      emailService.sendBookingConfirmation({
        booking,
        eventType,
        hostUser: users[0],
      }).catch(err => console.error('Email error:', err.message));

      res.status(201).json(booking);
    } catch (err) {
      // Handle double booking constraint violation
      if (err.code === '23P01') {
        return res.status(409).json({ error: 'This time slot is no longer available' });
      }
      next(err);
    }
  },
};

module.exports = bookingController;
