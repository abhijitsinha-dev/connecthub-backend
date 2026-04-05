import fs from 'fs';
import path from 'path';
import brevo from './mailer.js'; // Importing the default BrevoClient from mailer.js

/**
 * Send a generic email via Brevo API
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content
 * @returns {Promise} - Brevo response
 */
const sendEmail = async (to, subject, html, text) => {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Formatted for Brevo's sendTransacEmail method
      const response = await brevo.transactionalEmails.sendTransacEmail({
        subject: subject,
        htmlContent: html,
        textContent: text,
        sender: {
          name: 'ConnectHub',
          email: process.env.EMAIL_FROM,
        },
        to: [{ email: to }],
      });

      console.log('📧 Email sent successfully: ', response.messageId);
      return response;
    } catch (error) {
      // if (attempt === maxAttempts) throw error; // last attempt failed
      console.log(`Attempt ${attempt} failed, retrying in 2s...`);

      // Brevo errors are often deeply nested, this tries to log the most useful part
      console.error(error.body ? error.body : error.message);

      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

/**
 * @description Send a verification email with OTP
 * @param {string} email
 * @param {string} otp
 * @param {string} username
 * @returns {Promise} - Brevo response
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
