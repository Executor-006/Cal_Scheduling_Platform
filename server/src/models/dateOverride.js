const db = require('../db');

const DEFAULT_USER_ID = 1;

const DateOverride = {
  async findAll() {
    const { rows } = await db.query(
      'SELECT * FROM date_overrides WHERE user_id = $1 ORDER BY override_date ASC',
      [DEFAULT_USER_ID]
    );
    return rows;
  },

  async findByDate(userId, date) {
    const { rows } = await db.query(
      'SELECT * FROM date_overrides WHERE user_id = $1 AND override_date = $2',
      [userId, date]
    );
    return rows[0] || null;
  },

  async findByDateRange(userId, startDate, endDate) {
    const { rows } = await db.query(
      'SELECT * FROM date_overrides WHERE user_id = $1 AND override_date BETWEEN $2 AND $3 ORDER BY override_date ASC',
      [userId, startDate, endDate]
    );
    return rows;
  },

  async create({ override_date, is_blocked, start_time, end_time, label }) {
    const { rows } = await db.query(
      `INSERT INTO date_overrides (user_id, override_date, is_blocked, start_time, end_time, label)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [DEFAULT_USER_ID, override_date, is_blocked, is_blocked ? null : start_time, is_blocked ? null : end_time, label || null]
    );
    return rows[0];
  },

  async update(id, { is_blocked, start_time, end_time, label }) {
    const { rows } = await db.query(
      `UPDATE date_overrides SET is_blocked = $1, start_time = $2, end_time = $3, label = $4
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [is_blocked, is_blocked ? null : start_time, is_blocked ? null : end_time, label || null, id, DEFAULT_USER_ID]
    );
    return rows[0];
  },

  async delete(id) {
    const { rows } = await db.query(
      'DELETE FROM date_overrides WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, DEFAULT_USER_ID]
    );
    return rows[0];
  },
};

module.exports = DateOverride;
