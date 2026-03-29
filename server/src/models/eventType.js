const db = require('../db');

const DEFAULT_USER_ID = 1;

const EventType = {
  async findAll() {
    const { rows } = await db.query(
      'SELECT * FROM event_types WHERE user_id = $1 ORDER BY created_at DESC',
      [DEFAULT_USER_ID]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await db.query(
      'SELECT * FROM event_types WHERE id = $1 AND user_id = $2',
      [id, DEFAULT_USER_ID]
    );
    return rows[0];
  },

  async findBySlug(userId, slug) {
    const { rows } = await db.query(
      `SELECT et.*, u.username, u.name as user_name, u.timezone as user_timezone
       FROM event_types et JOIN users u ON et.user_id = u.id
       WHERE u.id = $1 AND et.slug = $2`,
      [userId, slug]
    );
    return rows[0];
  },

  async create({ title, slug, description, duration, buffer_time, custom_questions, schedule_id }) {
    const { rows } = await db.query(
      `INSERT INTO event_types (user_id, title, slug, description, duration, buffer_time, custom_questions, schedule_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [DEFAULT_USER_ID, title, slug, description || '', duration, buffer_time || 0, JSON.stringify(custom_questions || []), schedule_id || null]
    );
    return rows[0];
  },

  async update(id, { title, slug, description, duration, is_active, buffer_time, custom_questions, schedule_id }) {
    const { rows } = await db.query(
      `UPDATE event_types
       SET title = $1, slug = $2, description = $3, duration = $4, is_active = $5,
           buffer_time = $6, custom_questions = $7, schedule_id = $8, updated_at = NOW()
       WHERE id = $9 AND user_id = $10 RETURNING *`,
      [title, slug, description, duration, is_active, buffer_time || 0, JSON.stringify(custom_questions || []), schedule_id || null, id, DEFAULT_USER_ID]
    );
    return rows[0];
  },

  async toggleActive(id, is_active) {
    const { rows } = await db.query(
      'UPDATE event_types SET is_active = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      [is_active, id, DEFAULT_USER_ID]
    );
    return rows[0];
  },

  async delete(id) {
    const { rows } = await db.query(
      'DELETE FROM event_types WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, DEFAULT_USER_ID]
    );
    return rows[0];
  },
};

module.exports = EventType;
