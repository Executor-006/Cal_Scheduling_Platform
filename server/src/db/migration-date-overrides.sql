-- Migration: Add date_overrides table
-- Run this after initial schema.sql

CREATE TABLE IF NOT EXISTS date_overrides (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
    override_date   DATE NOT NULL,
    is_blocked      BOOLEAN DEFAULT false,
    start_time      TIME,
    end_time        TIME,
    label           VARCHAR(200),
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, override_date),
    CHECK (
        (is_blocked = true AND start_time IS NULL AND end_time IS NULL)
        OR (is_blocked = false AND start_time IS NOT NULL AND end_time IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_date_overrides_user_date ON date_overrides(user_id, override_date);
