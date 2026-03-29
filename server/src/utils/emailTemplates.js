const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

function formatDateTime(date, tz) {
  return dayjs(date).tz(tz).format('dddd, MMMM D, YYYY [at] h:mm A');
}

function formatTime(date, tz) {
  return dayjs(date).tz(tz).format('h:mm A');
}

function baseTemplate(content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        ${content}
      </div>
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;">
        Sent by Cal Clone Scheduling Platform
      </p>
    </body>
    </html>
  `;
}

function bookingConfirmation({ booking, eventType, hostUser }) {
  const tz = booking.booker_timezone || 'UTC';
  const subject = `Booking Confirmed: ${eventType.title}`;
  const html = baseTemplate(`
    <div style="background:#111827;padding:24px 32px;">
      <h1 style="color:#ffffff;font-size:20px;margin:0;">Booking Confirmed</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;font-size:15px;margin:0 0 24px;">
        Your booking has been scheduled successfully.
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">
        <h3 style="margin:0 0 12px;color:#111827;font-size:16px;">${eventType.title}</h3>
        <p style="margin:4px 0;color:#6b7280;font-size:14px;">
          <strong>When:</strong> ${formatDateTime(booking.start_time, tz)}
        </p>
        <p style="margin:4px 0;color:#6b7280;font-size:14px;">
          <strong>Duration:</strong> ${eventType.duration} minutes
        </p>
        <p style="margin:4px 0;color:#6b7280;font-size:14px;">
          <strong>Host:</strong> ${hostUser.name} (${hostUser.email})
        </p>
        <p style="margin:4px 0;color:#6b7280;font-size:14px;">
          <strong>Attendee:</strong> ${booking.booker_name} (${booking.booker_email})
        </p>
      </div>
    </div>
  `);

  return { subject, html };
}

function bookingCancellation({ booking, eventType, hostUser }) {
  const tz = booking.booker_timezone || 'UTC';
  const subject = `Booking Cancelled: ${eventType.title}`;
  const html = baseTemplate(`
    <div style="background:#dc2626;padding:24px 32px;">
      <h1 style="color:#ffffff;font-size:20px;margin:0;">Booking Cancelled</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;font-size:15px;margin:0 0 24px;">
        The following booking has been cancelled.
      </p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:20px;">
        <h3 style="margin:0 0 12px;color:#111827;font-size:16px;">${eventType.title}</h3>
        <p style="margin:4px 0;color:#6b7280;font-size:14px;">
          <strong>Was scheduled for:</strong> ${formatDateTime(booking.start_time, tz)}
        </p>
        <p style="margin:4px 0;color:#6b7280;font-size:14px;">
          <strong>Duration:</strong> ${eventType.duration} minutes
        </p>
        <p style="margin:4px 0;color:#6b7280;font-size:14px;">
          <strong>Host:</strong> ${hostUser.name}
        </p>
        <p style="margin:4px 0;color:#6b7280;font-size:14px;">
          <strong>Attendee:</strong> ${booking.booker_name}
        </p>
      </div>
    </div>
  `);

  return { subject, html };
}

function bookingReschedule({ oldBooking, newBooking, eventType, hostUser }) {
  const tz = newBooking.booker_timezone || oldBooking.booker_timezone || 'UTC';
  const subject = `Booking Rescheduled: ${eventType.title}`;
  const html = baseTemplate(`
    <div style="background:#2563eb;padding:24px 32px;">
      <h1 style="color:#ffffff;font-size:20px;margin:0;">Booking Rescheduled</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;font-size:15px;margin:0 0 24px;">
        Your booking has been rescheduled to a new time.
      </p>
      <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:20px;margin-bottom:16px;">
        <h4 style="margin:0 0 8px;color:#92400e;font-size:13px;text-transform:uppercase;">Previous Time</h4>
        <p style="margin:0;color:#78716c;font-size:14px;text-decoration:line-through;">
          ${formatDateTime(oldBooking.start_time, tz)}
        </p>
      </div>
      <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:20px;">
        <h4 style="margin:0 0 8px;color:#065f46;font-size:13px;text-transform:uppercase;">New Time</h4>
        <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">
          ${formatDateTime(newBooking.start_time, tz)}
        </p>
        <p style="margin:8px 0 0;color:#6b7280;font-size:14px;">
          <strong>Event:</strong> ${eventType.title} (${eventType.duration} min)
        </p>
        <p style="margin:4px 0 0;color:#6b7280;font-size:14px;">
          <strong>Host:</strong> ${hostUser.name}
        </p>
      </div>
    </div>
  `);

  return { subject, html };
}

module.exports = {
  bookingConfirmation,
  bookingCancellation,
  bookingReschedule,
};
