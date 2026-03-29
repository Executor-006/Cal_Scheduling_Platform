const nodemailer = require('nodemailer');
const templates = require('./emailTemplates');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    // Production/configured SMTP
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Dev mode — log to console
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
}

function getFrom() {
  return process.env.SMTP_FROM || 'Cal Clone <noreply@calclone.local>';
}

async function sendEmail(to, { subject, html }) {
  try {
    const transport = getTransporter();
    const info = await transport.sendMail({
      from: getFrom(),
      to,
      subject,
      html,
    });

    if (!process.env.SMTP_HOST) {
      // Dev mode — log the email details
      console.log(`📧 Email sent (dev mode):`);
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
    } else {
      console.log(`📧 Email sent to ${to}: ${subject}`);
    }
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err.message);
  }
}

async function sendBookingConfirmation({ booking, eventType, hostUser }) {
  const template = templates.bookingConfirmation({ booking, eventType, hostUser });
  // Send to both booker and host
  await Promise.all([
    sendEmail(booking.booker_email, template),
    sendEmail(hostUser.email, {
      subject: `New Booking: ${eventType.title} with ${booking.booker_name}`,
      html: template.html,
    }),
  ]);
}

async function sendBookingCancellation({ booking, eventType, hostUser }) {
  const template = templates.bookingCancellation({ booking, eventType, hostUser });
  await Promise.all([
    sendEmail(booking.booker_email, template),
    sendEmail(hostUser.email, template),
  ]);
}

async function sendBookingReschedule({ oldBooking, newBooking, eventType, hostUser }) {
  const template = templates.bookingReschedule({ oldBooking, newBooking, eventType, hostUser });
  await Promise.all([
    sendEmail(newBooking.booker_email || oldBooking.booker_email, template),
    sendEmail(hostUser.email, template),
  ]);
}

module.exports = {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingReschedule,
};
