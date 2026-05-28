const nodemailer = require('nodemailer');

let transporter = null;

const gmailOAuthConfigured =
  process.env.EMAIL_USER &&
  process.env.CLIENT_ID &&
  process.env.CLIENT_SECRET &&
  process.env.REFRESH_TOKEN;

const smtpLoginConfigured =
  process.env.SMTP_HOST &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS;

const isEmailConfigured = gmailOAuthConfigured || smtpLoginConfigured;

if (isEmailConfigured) {
  const transportOptions = {};

  if (gmailOAuthConfigured) {
    transportOptions.service = 'gmail';
    transportOptions.auth = {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    };
  } else {
    transportOptions.host = process.env.SMTP_HOST;
    transportOptions.port = parseInt(process.env.SMTP_PORT || '465', 10);
    transportOptions.secure = process.env.SMTP_SECURE === 'true' || transportOptions.port === 465;
    transportOptions.auth = {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    };
  }

  transporter = nodemailer.createTransport({
    ...transportOptions,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  transporter.verify((error) => {
    if (error) {
      console.log('⚠️ Email service is offline. Backend will operate normally without email notifications.');
      console.log('   Email error:', error.message || error);
    } else {
      console.log('✅ Email server is ready to send messages');
    }
  });
} else {
  console.log('ℹ️ Email notification service is inactive. Set EMAIL_USER and email credentials in env to enable it.');
}

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  if (!transporter) {
    console.log(`✉️ Simulated Email to <${to}>: "${subject}"`);
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error.message || error);
  }
};

async function sendRegistrationEmail(userEmail, name){
  const subject = `Welcome to Backend Ledger, ${name}!`;
  const text = `Hi ${name},\n\nThank you for registering with Backend Ledger. You can now login to your account.`;
  const html = `
    <h1>Welcome to Backend Ledger, ${name}!</h1>
    <p>Hi ${name},</p>
    <p>Thank you for registering with Backend Ledger. You can now login to your account.</p>
  `;
  await sendEmail(userEmail, subject, text, html);
}
async function sendTransactionEmail(userEmail, userName, amount, toAccount){
  const subject = `Transaction of ${amount} completed`;
  const text = `Hi ${userName},\n\nThank you for using Backend Ledger. Your transaction of ${amount} to account ${toAccount} has been completed successfully.`;
  const html = `
    <h1>Transaction of ${amount} completed</h1>
    <p>Hi ${userName},</p>
    <p>Thank you for using Backend Ledger. Your transaction of ${amount} to account ${toAccount} has been completed successfully.</p>
  `;
  await sendEmail(userEmail, subject, text, html);
}
async function sendTransactionFailedEmail(userEmail, userName, amount, toAccount){
  const subject = `Transaction of ${amount} failed`;
  const text = `Hi ${userName},\n\nThank you for using Backend Ledger. Your transaction of ${amount} to account ${toAccount} has failed.`;
  const html = `
    <h1>Transaction of ${amount} failed</h1>
    <p>Hi ${userName},</p>
    <p>Thank you for using Backend Ledger. Your transaction of ${amount} to account ${toAccount} has failed.</p>
  `;
  await sendEmail(userEmail, subject, text, html);
}
module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailedEmail
}