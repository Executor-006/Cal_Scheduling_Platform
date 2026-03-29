const Schedule = require('../models/schedule');

const scheduleController = {
  async list(req, res, next) {
    try {
      const schedules = await Schedule.findAll();
      res.json(schedules);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const schedule = await Schedule.findById(req.params.id);
      if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
      res.json(schedule);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Schedule name is required' });
      }
      const schedule = await Schedule.create({ name: name.trim() });
      res.status(201).json(schedule);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, is_default } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Schedule name is required' });
      }
      const schedule = await Schedule.update(id, { name: name.trim(), is_default });
      if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
      res.json(schedule);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const schedule = await Schedule.delete(req.params.id);
      if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
      res.json(schedule);
    } catch (err) {
      if (err.status === 400) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  },

  async updateAvailability(req, res, next) {
    try {
      const { id } = req.params;
      const { schedules } = req.body;
      if (!Array.isArray(schedules)) {
        return res.status(400).json({ error: 'Schedules array is required' });
      }
      const updated = await Schedule.updateAvailability(id, schedules);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = scheduleController;
