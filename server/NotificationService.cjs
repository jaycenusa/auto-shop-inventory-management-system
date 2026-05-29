const sendmail = require('sendmail')

const ALERT_EMAIL_TO = process.env.ALERT_EMAIL_TO || 'jaycenca.github@gmail.com'

/**
 * @param {{ subject: string; body: string; to?: string }} params
 */
async function sendEmailNotification({ subject, body, to = ALERT_EMAIL_TO }) {
  console.log("sending text ", body);
  await sendmail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: body,
  })
}

module.exports = { sendEmailNotification, ALERT_EMAIL_TO }
