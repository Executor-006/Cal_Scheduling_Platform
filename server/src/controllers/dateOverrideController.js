const DateOverride = require('../models/dateOverride');

const dateOverrideController = {
  async list(req, res, next) {
    try {
      const overrides = await DateOverride.findAll();
      res.json(overrides);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { override_date, is_blocked, start_time, end_time, label } = req.body;

      if (!override_date) {
        return res.status(400).json({ error: 'Date is required' });
      }
      if (!is_blocked && (!start_time || !end_time)) {
        return res.status(400).json({ error: 'Start time and end time are required for custom hours' });
      }

      const override = await DateOverride.create({ override_date, is_blocked, start_time, end_time, label });
      res.status(201).json(override);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'An override already exists for this date' });
      }
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { is_blocked, start_time, end_time, label } = req.body;

      const override = await DateOverride.update(id, { is_blocked, start_time, end_time, label });
      if (!override) return res.status(404).json({ error: 'Override not found' });
      res.json(override);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const override = await DateOverride.delete(id);
      if (!override) return res.status(404).json({ error: 'Override not found' });
      res.json(override);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = dateOverrideController;
