// Test script for sending emails using Google SMTP
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../supabase/.env') });

// Read the App Password from the environment
const appPassword = process.env.GOOGLE_APP_PASSWORD;

if (!appPassword) {
  console.error('Error: GOOGLE_APP_PASSWORD not found in environment variables');
  console.error('Make sure you have set it in supabase/.env file');
  process.exit(1);
}

// Create a transporter using Google SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'admin@itsfait.com',
    pass: appPassword
  },
  debug: true, // Show debug output
  logger: true  // Log information to console
});

// Verify SMTP connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP Verification Error:', error);
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});

// Email content
const mailOptions = {
  from: '"FAIT" <admin@itsfait.com>',
  to: 'admin@itsfait.com', // Send to yourself for testing
  subject: 'Test Email - Password Reset Configuration',
  text: 'This is a test email to verify that your SMTP configuration is working correctly.',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #333;">SMTP Configuration Test</h2>
      <p>This is a test email to verify that your SMTP configuration is working correctly.</p>
      <p>If you're seeing this email, it means your configuration is successful!</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>This is an automated test email. Please do not reply.</p>
      </div>
    </div>
  `
};

// Send the test email
console.log('Sending test email...');

// Using async/await with IIFE for ES modules
(async () => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);

    if (info.testMessageUrl) {
      console.log('Preview URL:', info.testMessageUrl);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error sending email:', error);
    process.exit(1);
  }
})();
