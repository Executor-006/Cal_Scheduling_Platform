const EventType = require('../models/eventType');

const eventTypeController = {
  async list(req, res, next) {
    try {
      const eventTypes = await EventType.findAll();
      res.json(eventTypes);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { title, slug, description, duration, buffer_time, custom_questions, schedule_id } = req.body;
      const eventType = await EventType.create({
        title, slug, description,
        duration: Number(duration),
        buffer_time: Number(buffer_time) || 0,
        custom_questions: custom_questions || [],
        schedule_id: schedule_id || null,
      });
      res.status(201).json(eventType);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'An event type with this slug already exists' });
      }
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title, slug, description, duration, is_active, buffer_time, custom_questions, schedule_id } = req.body;
      const eventType = await EventType.update(id, {
        title, slug, description,
        duration: Number(duration),
        is_active,
        buffer_time: Number(buffer_time) || 0,
        custom_questions: custom_questions || [],
        schedule_id: schedule_id || null,
      });
      if (!eventType) return res.status(404).json({ error: 'Event type not found' });
      res.json(eventType);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'An event type with this slug already exists' });
      }
      next(err);
    }
  },

  async toggleActive(req, res, next) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      const eventType = await EventType.toggleActive(id, is_active);
      if (!eventType) return res.status(404).json({ error: 'Event type not found' });
      res.json(eventType);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const eventType = await EventType.delete(id);
      if (!eventType) return res.status(404).json({ error: 'Event type not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = eventTypeController;
