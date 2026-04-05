import fs from 'fs';
import path from 'path';
import transporter from './mailer.js';

/**
 * Send a generic email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content
 * @returns {Promise} - Nodemailer response
 */
const sendEmail = async (to, subject, html, text) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  };
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('📧Email sent: ', info.messageId);
      return info;
    } catch (error) {
      // if (attempt === maxAttempts) throw error; // last attempt failed
      console.log(`Attempt ${attempt} failed, retrying in 2s...`);
      console.log(error);

      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

/**
 * @description Send a verification email with OTP
 * @param {string} email
 * @param {string} otp
 * @param {string} username
 * @returns {Promise} - Nodemailer response
 */
const sendVerificationEmail = async (email, otp, username) => {
  const subject = 'Verify your email';

  let text = fs.readFileSync(
    path.join(import.meta.dirname, './templates/emailVerification.txt'),
    'utf-8'
  );
  text = text
    .replace(/{{USERNAME}}/g, username)
    .replace(/{{OTP_CODE}}/g, otp)
    .replace(/{{USER_EMAIL}}/g, email)
    .replace(/{{CURRENT_YEAR}}/g, new Date().getFullYear().toString());

  let html = fs.readFileSync(
    path.join(import.meta.dirname, './templates/emailVerification.html'),
    'utf-8'
  );
  html = html
    .replace(/{{USERNAME}}/g, username)
    .replace(/{{OTP_CODE}}/g, otp)
    .replace(/{{USER_EMAIL}}/g, email)
    .replace(/{{CURRENT_YEAR}}/g, new Date().getFullYear().toString());

  return sendEmail(email, subject, html, text);
};

export { sendVerificationEmail };
