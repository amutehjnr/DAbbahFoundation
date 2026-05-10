'use strict';

const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a plain email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"D'Abbah Foundation" <noreply@dabbahfoundation.org>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error(`Email failed to ${to}: ${err.message}`);
    return { success: false, error: err.message };
  }
};

/**
 * Send contact confirmation email to submitter
 */
const sendContactConfirmation = (name, email, subject) => sendEmail({
  to: email,
  subject: `We received your message — D'Abbah Foundation`,
  html: `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F7F3ED; padding: 40px 20px;">
      <div style="background: #0B1F3A; border-radius: 16px; padding: 40px; text-align: center; margin-bottom: 24px;">
        <p style="color: #E8B84B; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px;">D'Abbah Foundation</p>
        <h1 style="color: white; font-size: 28px; margin: 0; font-family: Georgia, serif;">Thank You, ${name}</h1>
      </div>
      <div style="background: white; border-radius: 16px; padding: 32px;">
        <p style="color: #3A5068; line-height: 1.8;">We've received your message regarding <strong>"${subject}"</strong> and will respond within 24–48 business hours.</p>
        <p style="color: #3A5068; line-height: 1.8;">If your inquiry is urgent, you can also reach us by phone at <strong>+234 800 000 0000</strong>.</p>
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; text-align: center;">
          <p style="color: #9CB0C2; font-size: 12px;">D'Abbah Foundation — Building Hope. Restoring Lives.<br/>Abuja, Federal Capital Territory, Nigeria</p>
        </div>
      </div>
    </div>
  `,
});

/**
 * Send donation receipt
 */
const sendDonationReceipt = (donor, amount, currency, reference, purpose) => sendEmail({
  to: donor.email,
  subject: `Donation Receipt — D'Abbah Foundation`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F7F3ED; padding: 40px 20px;">
      <div style="background: #0B1F3A; border-radius: 16px; padding: 40px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: #E8B84B; font-size: 28px; margin: 0; font-family: Georgia, serif;">❤️ Thank You!</h1>
        <p style="color: rgba(255,255,255,0.7); margin-top: 8px;">Your generosity makes a real difference.</p>
      </div>
      <div style="background: white; border-radius: 16px; padding: 32px;">
        <p style="color: #3A5068;">Dear ${donor.anonymous ? 'Generous Donor' : donor.name},</p>
        <p style="color: #3A5068; line-height: 1.8;">We have successfully received your donation. Here are your details:</p>
        <div style="background: #F7F3ED; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <table width="100%">
            <tr><td style="color: #6B8299; font-size: 13px; padding: 6px 0;">Amount</td><td style="text-align: right; font-weight: 700; color: #0B1F3A;">${currency} ${parseInt(amount).toLocaleString()}</td></tr>
            <tr><td style="color: #6B8299; font-size: 13px; padding: 6px 0;">Purpose</td><td style="text-align: right; color: #0B1F3A; text-transform: capitalize;">${(purpose || 'general').replace('_', ' ')}</td></tr>
            <tr><td style="color: #6B8299; font-size: 13px; padding: 6px 0;">Reference</td><td style="text-align: right; font-family: monospace; font-size: 12px; color: #0B1F3A;">${reference}</td></tr>
            <tr><td style="color: #6B8299; font-size: 13px; padding: 6px 0;">Date</td><td style="text-align: right; color: #0B1F3A;">${new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
          </table>
        </div>
        <p style="color: #3A5068; line-height: 1.8;">Your contribution directly funds our programs reaching youth across Nigeria. <strong>You are part of the movement.</strong></p>
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; text-align: center;">
          <p style="color: #9CB0C2; font-size: 12px;">D'Abbah Foundation | Registered NGO, Nigeria<br/>info@dabbahfoundation.org | +234 800 000 0000</p>
        </div>
      </div>
    </div>
  `,
});

/**
 * Alert admin of new contact submission
 */
const alertAdminNewContact = (name, email, subject, message) => sendEmail({
  to: process.env.ADMIN_EMAIL || 'admin@dabbahfoundation.org',
  subject: `[New Contact] ${subject} — from ${name}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #0B1F3A;">New Contact Submission</h2>
      <table width="100%" style="border-collapse:collapse;">
        <tr><td style="padding:8px; border-bottom:1px solid #eee; color:#6B8299; font-size:13px;">Name</td><td style="padding:8px; border-bottom:1px solid #eee;">${name}</td></tr>
        <tr><td style="padding:8px; border-bottom:1px solid #eee; color:#6B8299; font-size:13px;">Email</td><td style="padding:8px; border-bottom:1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:8px; border-bottom:1px solid #eee; color:#6B8299; font-size:13px;">Subject</td><td style="padding:8px; border-bottom:1px solid #eee;">${subject}</td></tr>
        <tr><td style="padding:8px; vertical-align:top; color:#6B8299; font-size:13px;">Message</td><td style="padding:8px;">${message.replace(/\n/g, '<br>')}</td></tr>
      </table>
      <p style="margin-top:24px;"><a href="${process.env.APP_URL}/admin/contacts" style="background:#C9962A; color:#071527; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:700;">View in Dashboard →</a></p>
    </div>
  `,
});

module.exports = { sendEmail, sendContactConfirmation, sendDonationReceipt, alertAdminNewContact };
