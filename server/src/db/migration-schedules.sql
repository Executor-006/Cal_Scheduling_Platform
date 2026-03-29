-- Migration: Add multiple availability schedules support
-- Run this after schema.sql and migration-date-overrides.sql

-- 1. Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    is_default  BOOLEAN DEFAULT false,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedules_user ON schedules(user_id);

-- 2. Create default schedule for existing user
INSERT INTO schedules (user_id, name, is_default) VALUES (1, 'Working Hours', true);

-- 3. Add schedule_id column to availability
ALTER TABLE availability ADD COLUMN IF NOT EXISTS schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE;

-- 4. Link existing availability rows to the default schedule
UPDATE availability SET schedule_id = (SELECT id FROM schedules WHERE user_id = 1 AND is_default = true LIMIT 1) WHERE user_id = 1;

-- 5. Drop old unique constraint and add new one
ALTER TABLE availability DROP CONSTRAINT IF EXISTS availability_user_id_day_of_week_key;
ALTER TABLE availability ADD CONSTRAINT availability_schedule_day_unique UNIQUE(schedule_id, day_of_week);

-- 6. Add schedule_id to event_types (nullable — NULL means use default schedule)
ALTER TABLE event_types ADD COLUMN IF NOT EXISTS schedule_id INTEGER REFERENCES schedules(id) ON DELETE SET NULL;
