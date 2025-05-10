const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Initialize email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Email templates
const templates = {
  booking_confirmation: {
    subject: 'Booking Confirmation',
    html: (data) => `
      <h1>Booking Confirmation</h1>
      <p>Hello ${data.name},</p>
      <p>Your booking for <strong>${data.service_title}</strong> has been confirmed.</p>
      <p>Date: ${data.booking_date}</p>
      <p>Time: ${data.booking_time}</p>
      <p>Service Agent: ${data.service_agent_name}</p>
      <p>Thank you for using FAIT Co-op!</p>
    `
  },
  booking_reminder: {
    subject: 'Upcoming Booking Reminder',
    html: (data) => `
      <h1>Upcoming Booking Reminder</h1>
      <p>Hello ${data.name},</p>
      <p>This is a reminder about your upcoming booking for <strong>${data.service_title}</strong>.</p>
      <p>Date: ${data.booking_date}</p>
      <p>Time: ${data.booking_time}</p>
      <p>${data.service_agent_name ? `Service Agent: ${data.service_agent_name}` : `Client: ${data.client_name}`}</p>
      <p>Thank you for using FAIT Co-op!</p>
    `
  },
  booking_cancellation: {
    subject: 'Booking Cancellation',
    html: (data) => `
      <h1>Booking Cancellation</h1>
      <p>Hello ${data.name},</p>
      <p>Your booking for <strong>${data.service_title}</strong> has been cancelled.</p>
      <p>Date: ${data.booking_date}</p>
      <p>Time: ${data.booking_time}</p>
      <p>Reason: ${data.cancellation_reason || 'No reason provided'}</p>
      <p>If you have any questions, please contact us.</p>
      <p>Thank you for using FAIT Co-op!</p>
    `
  },
  welcome: {
    subject: 'Welcome to FAIT Co-op',
    html: (data) => `
      <h1>Welcome to FAIT Co-op!</h1>
      <p>Hello ${data.name},</p>
      <p>Thank you for joining FAIT Co-op! We're excited to have you as part of our community.</p>
      <p>FAIT Co-op is a cooperative marketplace connecting clients with skilled service agents.</p>
      <p>To get started, please complete your profile and explore the available services.</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,</p>
      <p>The FAIT Co-op Team</p>
    `
  },
  verification_approved: {
    subject: 'Verification Approved',
    html: (data) => `
      <h1>Verification Approved</h1>
      <p>Hello ${data.name},</p>
      <p>Congratulations! Your verification has been approved.</p>
      <p>Verification Level: ${data.verification_level}</p>
      <p>You can now offer your services on the FAIT Co-op platform.</p>
      <p>Thank you for being part of our community!</p>
    `
  },
  verification_rejected: {
    subject: 'Verification Rejected',
    html: (data) => `
      <h1>Verification Rejected</h1>
      <p>Hello ${data.name},</p>
      <p>We regret to inform you that your verification has been rejected.</p>
      <p>Reason: ${data.rejection_reason || 'No reason provided'}</p>
      <p>Please review the requirements and submit a new verification request.</p>
      <p>If you have any questions, please contact us.</p>
    `
  },
  subscription_confirmation: {
    subject: 'Subscription Confirmation',
    html: (data) => `
      <h1>Subscription Confirmation</h1>
      <p>Hello ${data.name},</p>
      <p>Thank you for subscribing to the <strong>${data.plan_name}</strong> plan.</p>
      <p>Your subscription is now active and will renew on ${data.renewal_date}.</p>
      <p>Thank you for using FAIT Co-op!</p>
    `
  },
  subscription_renewal: {
    subject: 'Subscription Renewal Reminder',
    html: (data) => `
      <h1>Subscription Renewal Reminder</h1>
      <p>Hello ${data.name},</p>
      <p>Your <strong>${data.plan_name}</strong> subscription will renew on ${data.expiry_date}.</p>
      <p>If you wish to make any changes to your subscription, please do so before the renewal date.</p>
      <p>Thank you for using FAIT Co-op!</p>
    `
  },
  document_expiration: {
    subject: 'Document Expiration Reminder',
    html: (data) => `
      <h1>Document Expiration Reminder</h1>
      <p>Hello ${data.name},</p>
      <p>Your document <strong>${data.document_name}</strong> will expire on ${data.expiry_date}.</p>
      <p>Please update your document before it expires to maintain your verification status.</p>
      <p>Thank you for using FAIT Co-op!</p>
    `
  }
};

/**
 * Process email jobs
 * @param {Object} job - Bull job object
 */
const emailProcessor = async (job) => {
  try {
    const { type, recipient, data } = job.data;
    
    // Get template
    const template = templates[type];
    if (!template) {
      throw new Error(`Email template "${type}" not found`);
    }
    
    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@fait-coop.com',
      to: recipient,
      subject: template.subject,
      html: template.html(data)
    };
    
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`, { type, recipient });
    
    return info;
  } catch (error) {
    logger.error('Error processing email job:', error);
    throw error;
  }
};

module.exports = emailProcessor;
