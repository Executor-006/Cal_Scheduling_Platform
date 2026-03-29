const db = require('../db');

const DEFAULT_USER_ID = 1;

const Schedule = {
  async findAll() {
    const { rows } = await db.query(
      `SELECT s.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', a.id, 'day_of_week', a.day_of_week,
              'start_time', a.start_time, 'end_time', a.end_time, 'is_active', a.is_active
            ) ORDER BY a.day_of_week
          ) FILTER (WHERE a.id IS NOT NULL), '[]'
        ) as availability
       FROM schedules s
       LEFT JOIN availability a ON a.schedule_id = s.id
       WHERE s.user_id = $1
       GROUP BY s.id
       ORDER BY s.is_default DESC, s.created_at ASC`,
      [DEFAULT_USER_ID]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await db.query(
      `SELECT s.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', a.id, 'day_of_week', a.day_of_week,
              'start_time', a.start_time, 'end_time', a.end_time, 'is_active', a.is_active
            ) ORDER BY a.day_of_week
          ) FILTER (WHERE a.id IS NOT NULL), '[]'
        ) as availability
       FROM schedules s
       LEFT JOIN availability a ON a.schedule_id = s.id
       WHERE s.id = $1 AND s.user_id = $2
       GROUP BY s.id`,
      [id, DEFAULT_USER_ID]
    );
    return rows[0];
  },

  async findDefault(userId) {
    const { rows } = await db.query(
      'SELECT * FROM schedules WHERE user_id = $1 AND is_default = true LIMIT 1',
      [userId]
    );
    return rows[0];
  },

  async create({ name }) {
    const { rows } = await db.query(
      'INSERT INTO schedules (user_id, name, is_default) VALUES ($1, $2, false) RETURNING *',
      [DEFAULT_USER_ID, name]
    );
    return rows[0];
  },

  async update(id, { name, is_default }) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // If setting as default, unset others first
      if (is_default) {
        await client.query(
          'UPDATE schedules SET is_default = false WHERE user_id = $1',
          [DEFAULT_USER_ID]
        );
      }

      const { rows } = await client.query(
        'UPDATE schedules SET name = $1, is_default = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING *',
        [name, is_default, id, DEFAULT_USER_ID]
      );

      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async delete(id) {
    // Prevent deleting the default schedule
    const schedule = await this.findById(id);
    if (!schedule) return null;
    if (schedule.is_default) {
      throw { status: 400, message: 'Cannot delete the default schedule' };
    }

    const { rows } = await db.query(
      'DELETE FROM schedules WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, DEFAULT_USER_ID]
    );
    return rows[0];
  },

  async updateAvailability(scheduleId, schedules) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Delete existing availability for this schedule
      await client.query('DELETE FROM availability WHERE schedule_id = $1', [scheduleId]);

      // Insert new active ones
      for (const s of schedules) {
        if (s.is_active) {
          await client.query(
            `INSERT INTO availability (user_id, schedule_id, day_of_week, start_time, end_time, is_active)
             VALUES ($1, $2, $3, $4, $5, true)`,
            [DEFAULT_USER_ID, scheduleId, s.day_of_week, s.start_time, s.end_time]
          );
        }
      }

      await client.query('COMMIT');

      // Return updated schedule with availability
      return this.findById(scheduleId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = Schedule;
