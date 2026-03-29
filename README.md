# Cal Clone - Scheduling Platform

A full-stack scheduling/booking web application inspired by [Cal.com](https://cal.com). Users can create event types, set their availability, and let others book time slots through a public booking page.

## Live Deployment

- Frontend: [https://cal-scheduling-platform-one.vercel.app](https://cal-scheduling-platform-one.vercel.app)
- Backend API: [https://cal-scheduling-platform.onrender.com](https://cal-scheduling-platform.onrender.com)
- Database: Neon PostgreSQL

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, Tailwind CSS, React Router, dayjs, Lucide Icons |
| **Backend** | Node.js, Express.js, Nodemailer |
| **Database** | PostgreSQL |

## Features

### Core Features
- **Event Types Management** - Create, edit, delete event types with title, description, duration, and URL slug. Each event type has a unique public booking link.
- **Availability Settings** - Set available days and time ranges per day with timezone support.
- **Public Booking Page** - Calendar date picker, available time slots display, booking form (name + email), double-booking prevention, and confirmation page.
- **Bookings Dashboard** - View upcoming/past bookings with cancel functionality.

### Bonus Features
- **Responsive Design** - Fully responsive across mobile, tablet, and desktop. Mobile bottom navigation bar, step-by-step public booking flow on small screens, bottom-sheet modals.
- **Multiple Availability Schedules** - Create named schedules (e.g., "Working Hours", "Weekend"), set one as default, and assign specific schedules to event types.
- **Date Overrides** - Block specific dates (holidays, vacation) or set custom hours that override the weekly schedule.
- **Rescheduling** - Reschedule existing bookings through a modal with calendar + time slot picker.
- **Email Notifications** - Sends confirmation, cancellation, and reschedule emails to both booker and host. Uses Nodemailer with configurable SMTP (logs to console in dev mode).
- **Buffer Time** - Configurable buffer time between meetings (0, 5, 10, 15, or 30 minutes).
- **Custom Booking Questions** - Add custom questions (text, textarea, phone) to event types. Answers are collected during booking and displayed in the bookings dashboard.

## Database Schema

```
users            - Default hardcoded user (no auth)
schedules        - Named availability schedules (multiple per user, one default)
event_types      - Title, slug, duration, buffer_time, custom_questions (JSONB), schedule_id
availability     - Day of week, start/end time per schedule
date_overrides   - Block dates or set custom hours per user
bookings         - Start/end time (UTC), status, booker info, rescheduled_from reference
booking_answers  - Custom question responses per booking
```

Key design decisions:
- **UTC storage** - All booking times stored in UTC, converted for display
- **EXCLUDE constraint** - PostgreSQL range exclusion prevents double-booking at the database level
- **JSONB for questions** - Flexible custom questions without extra join tables for the schema
- **Rescheduling chain** - `rescheduled_from` foreign key tracks booking history
- **Schedule resolution** - Event types can use a specific schedule or fall back to user's default
- **Override priority** - Date overrides take precedence over weekly schedules

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE calclone"

# Run schema (creates tables, indexes, constraints)
psql -U postgres -d calclone -f server/src/db/schema.sql

# Seed sample data (default user, schedule, event types, availability, sample bookings)
psql -U postgres -d calclone -f server/src/db/seed.sql
```

### 2. Backend Setup

```bash
cd server
cp ../.env.example .env
# Edit .env with your PostgreSQL credentials:
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/calclone
npm install
npm run dev          # Starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd client
npm install
npm start            # Starts on http://localhost:3000
```

### 4. Access the App

- **Admin Dashboard**: http://localhost:3000/dashboard
- **Public Booking Page**: http://localhost:3000/arnav/30min

### 5. Email Notifications (Optional)

By default, emails are logged to the console. To enable real email delivery, add SMTP credentials to your `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Cal Clone <your-email@gmail.com>
```

For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833).

## Deployment

This project is deployed with:

- Vercel for the React frontend
- Render for the Express backend
- Neon for the PostgreSQL database

### Production Architecture

- `client` is deployed as a Vercel project
- `server` is deployed as a Render Web Service
- Render connects to Neon using `DATABASE_URL`
- Vercel connects to Render using `REACT_APP_API_URL`
- Render allows the frontend origin through `CORS_ORIGIN`

### Neon Setup

For a fresh Neon database, run:

```bash
psql "YOUR_NEON_DATABASE_URL" -f server/src/db/schema.sql
psql "YOUR_NEON_DATABASE_URL" -f server/src/db/seed.sql
```

Notes:

- Run `schema.sql` first
- Run `seed.sql` if you want sample user, schedules, event types, and bookings
- The migration files are for upgrading older databases and are not needed for a fresh Neon database

### Render Backend Deployment

Create a Render Web Service from the GitHub repository with these settings:

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

Required environment variables:

```env
DATABASE_URL=your-neon-connection-string
CORS_ORIGIN=https://cal-scheduling-platform-one.vercel.app
```

Optional email variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Cal Clone <your-email@gmail.com>
```

Production backend URL:

```text
https://cal-scheduling-platform.onrender.com
```

Health check example:

```text
https://cal-scheduling-platform.onrender.com/api/me
```

### Vercel Frontend Deployment

Create a Vercel project from the same GitHub repository with these settings:

- Framework Preset: `Create React App`
- Root Directory: `client`
- Build Command: `react-scripts build`
- Output Directory: `build`

Required environment variable:

```env
REACT_APP_API_URL=https://cal-scheduling-platform.onrender.com/api
```

Production frontend URL:

```text
https://cal-scheduling-platform-one.vercel.app
```

### SPA Routing on Vercel

Because the frontend uses React Router with browser history, direct visits to routes like `/dashboard` or `/arnav/30min` need a Vercel rewrite.

Create `client/vercel.json` with:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Deployment Order

1. Create the Neon database and run `schema.sql`
2. Run `seed.sql` if sample data is needed
3. Deploy the backend to Render
4. Verify `https://cal-scheduling-platform.onrender.com/api/me`
5. Deploy the frontend to Vercel
6. Set `REACT_APP_API_URL` to the Render API URL
7. Set `CORS_ORIGIN` on Render to the final Vercel domain
8. Redeploy Render after updating `CORS_ORIGIN`

## Assumptions

- **No authentication** - A single default user (John Doe) is assumed to be logged in on the admin side. The public booking page is accessible without login.
- **Slug uniqueness** - Event type slugs are unique per user, enforced at the database level.
- **UTC storage** - All booking timestamps are stored in UTC and converted to the appropriate timezone for display.
- **Buffer time** - Applied symmetrically around bookings during slot generation.
- **Date overrides** - Applied per user (across all schedules), not per schedule.

## Project Structure

```
cal-clone/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── layout/         # Shell, Sidebar, TopBar, BottomNav
│   │   │   ├── event-types/    # EventTypeCard, EventTypeForm, EventTypeList
│   │   │   ├── availability/   # AvailabilityForm, DaySlotPicker, TimezoneSelect,
│   │   │   │                   # DateOverrideForm, DateOverrideList
│   │   │   ├── booking/        # CalendarView, TimeSlotList, BookingForm, Confirmation
│   │   │   ├── bookings/       # BookingCard, BookingsList, RescheduleModal
│   │   │   └── ui/             # Button, Modal, Badge, Toggle, Input
│   │   ├── pages/              # Dashboard, Availability, Bookings, PublicBooking
│   │   ├── hooks/              # useEventTypes, useAvailability, useBookings, useUser,
│   │   │                       # useSchedules, useDateOverrides
│   │   └── lib/                # API client, date utilities, constants
│   └── package.json
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── routes/             # Express route definitions
│   │   ├── controllers/        # Request handling logic
│   │   ├── models/             # Database query functions
│   │   ├── middleware/         # Error handler, request validation
│   │   ├── utils/              # Slot generation, email service, email templates
│   │   └── db/                 # Connection pool, schema, migrations, seed data
│   └── package.json
│
└── README.md
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/me` | Get current user info |
| GET | `/api/event-types` | List all event types |
| POST | `/api/event-types` | Create event type |
| PUT | `/api/event-types/:id` | Update event type |
| PATCH | `/api/event-types/:id/toggle` | Toggle active status |
| DELETE | `/api/event-types/:id` | Delete event type |
| GET | `/api/schedules` | List all availability schedules |
| POST | `/api/schedules` | Create new schedule |
| PUT | `/api/schedules/:id` | Update schedule name/default |
| DELETE | `/api/schedules/:id` | Delete schedule |
| PUT | `/api/schedules/:id/availability` | Update schedule's weekly hours |
| GET | `/api/availability` | Get weekly availability (legacy) |
| PUT | `/api/availability` | Update availability (legacy) |
| GET | `/api/date-overrides` | List date overrides |
| POST | `/api/date-overrides` | Create date override |
| PUT | `/api/date-overrides/:id` | Update date override |
| DELETE | `/api/date-overrides/:id` | Delete date override |
| GET | `/api/bookings?status=upcoming\|past` | List bookings |
| GET | `/api/bookings/:id` | Get single booking |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking |
| POST | `/api/bookings/:id/reschedule` | Reschedule booking |
| GET | `/api/public/:username/:slug` | Get event type info (public) |
| GET | `/api/public/:username/:slug/slots` | Get available slots (public) |
| POST | `/api/public/:username/:slug/book` | Create booking (public) |
