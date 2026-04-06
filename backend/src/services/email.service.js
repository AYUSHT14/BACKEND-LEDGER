const nodemailer = require('nodemailer');
 

//transporters connect to SMTP server to communicate and send emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
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
async function sendTransactionEmail(fromUserEmail, toUserEmail, amount){
  const subject = `Transaction of ${amount} completed`;
  const text = `Hi ${fromUserEmail} and ${toUserEmail},\n\nThank you for using Backend Ledger. Your transaction of ${amount} has been completed successfully.`;
  const html = `
    <h1>Transaction of ${amount} completed</h1>
    <p>Hi ${fromUserEmail} and ${toUserEmail},</p>
    <p>Thank you for using Backend Ledger. Your transaction of ${amount} has been completed successfully.</p>
  `;
  await sendEmail(fromUserEmail, toUserEmail, subject, text, html);
}
async function sendTransactionFailedEmail(fromUserEmail, toUserEmail, amount){
  const subject = `Transaction of ${amount} failed`;
  const text = `Hi ${fromUserEmail} and ${toUserEmail},\n\nThank you for using Backend Ledger. Your transaction of ${amount} has been failed.`;
  const html = `
    <h1>Transaction of ${amount} failed</h1>
    <p>Hi ${fromUserEmail} and ${toUserEmail},</p>
    <p>Thank you for using Backend Ledger. Your transaction of ${amount} has been failed.</p>
  `;
  await sendEmail(fromUserEmail, toUserEmail, subject, text, html);
}
module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailedEmail
}