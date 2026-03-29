-- Default user
INSERT INTO users (username, name, email, timezone)
VALUES ('arnav', 'Arnav Sharma', 'sharma30terminator@gmail.com', 'Asia/Kolkata')
ON CONFLICT DO NOTHING;

-- Default schedule
INSERT INTO schedules (user_id, name, is_default) VALUES
(1, 'Working Hours', true)
ON CONFLICT DO NOTHING;

-- Event types with buffer time and custom questions
INSERT INTO event_types (user_id, title, slug, description, duration, buffer_time, custom_questions) VALUES
(1, '15 Minute Meeting', '15min', 'Quick chat or check-in', 15, 5, '[]'),
(1, '30 Minute Meeting', '30min', 'Standard meeting duration', 30, 10, '[{"label":"What would you like to discuss?","type":"text","required":false}]'),
(1, '60 Minute Consultation', '60min', 'In-depth discussion or consultation', 60, 15, '[{"label":"Reason for visit","type":"text","required":true},{"label":"Phone number","type":"text","required":false}]')
ON CONFLICT DO NOTHING;

-- Availability (Mon-Fri 9am-5pm) linked to default schedule
INSERT INTO availability (user_id, schedule_id, day_of_week, start_time, end_time) VALUES
(1, 1, 1, '09:00', '17:00'),
(1, 1, 2, '09:00', '17:00'),
(1, 1, 3, '09:00', '17:00'),
(1, 1, 4, '09:00', '17:00'),
(1, 1, 5, '09:00', '17:00')
ON CONFLICT DO NOTHING;

-- Sample bookings
INSERT INTO bookings (event_type_id, booker_name, booker_email, start_time, end_time, booker_timezone) VALUES
(2, 'Alice Smith', 'alice@example.com', '2026-04-01 03:30:00+00', '2026-04-01 04:00:00+00', 'Asia/Kolkata'),
(2, 'Bob Jones', 'bob@example.com', '2026-04-01 04:30:00+00', '2026-04-01 05:00:00+00', 'Asia/Kolkata'),
(3, 'Carol White', 'carol@example.com', '2026-04-02 08:30:00+00', '2026-04-02 09:30:00+00', 'Asia/Kolkata');
