require('dotenv').config();
const Bull = require('bull');
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const logger = require('./utils/logger');

// Import job processors
const emailProcessor = require('./processors/emailProcessor');
const bookingProcessor = require('./processors/bookingProcessor');
const subscriptionProcessor = require('./processors/subscriptionProcessor');
const notificationProcessor = require('./processors/notificationProcessor');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create queues
const emailQueue = new Bull('email', process.env.REDIS_URL);
const bookingQueue = new Bull('booking', process.env.REDIS_URL);
const subscriptionQueue = new Bull('subscription', process.env.REDIS_URL);
const notificationQueue = new Bull('notification', process.env.REDIS_URL);

// Process jobs
emailQueue.process(emailProcessor);
bookingQueue.process(bookingProcessor);
subscriptionQueue.process(subscriptionProcessor);
notificationQueue.process(notificationProcessor);

// Schedule recurring tasks

// Check for upcoming bookings and send reminders (every hour)
cron.schedule('0 * * * *', async () => {
  try {
    logger.info('Running upcoming booking reminder check');
    
    // Get bookings that are 24 hours away
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, client_id, service_agent_id, booking_date, start_time, service_packages(title)')
      .eq('booking_date', tomorrowDate)
      .eq('status', 'confirmed');
      
    if (error) {
      logger.error('Error fetching upcoming bookings:', error);
      return;
    }
    
    // Queue reminder emails for each booking
    for (const booking of bookings) {
      // Get client and service agent emails
      const { data: client } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', booking.client_id)
        .single();
        
      const { data: serviceAgent } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', booking.service_agent_id)
        .single();
        
      if (client && client.email) {
        emailQueue.add({
          type: 'booking_reminder',
          recipient: client.email,
          data: {
            name: client.full_name,
            booking_id: booking.id,
            service_title: booking.service_packages?.title || 'Service',
            booking_date: booking.booking_date,
            booking_time: booking.start_time,
            service_agent_name: serviceAgent?.full_name || 'Service Agent'
          }
        });
      }
      
      if (serviceAgent && serviceAgent.email) {
        emailQueue.add({
          type: 'booking_reminder',
          recipient: serviceAgent.email,
          data: {
            name: serviceAgent.full_name,
            booking_id: booking.id,
            service_title: booking.service_packages?.title || 'Service',
            booking_date: booking.booking_date,
            booking_time: booking.start_time,
            client_name: client?.full_name || 'Client'
          }
        });
      }
    }
    
    logger.info(`Queued ${bookings.length * 2} booking reminder emails`);
  } catch (error) {
    logger.error('Error in booking reminder cron job:', error);
  }
});

// Check for expiring subscriptions (daily at midnight)
cron.schedule('0 0 * * *', async () => {
  try {
    logger.info('Running expiring subscription check');
    
    // Get subscriptions expiring in 3 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);
    const expiryDateStr = expiryDate.toISOString();
    
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('id, user_id, current_period_end, plans(name)')
      .eq('status', 'active')
      .lt('current_period_end', expiryDateStr);
      
    if (error) {
      logger.error('Error fetching expiring subscriptions:', error);
      return;
    }
    
    // Queue renewal reminder emails
    for (const subscription of subscriptions) {
      // Get user email
      const { data: user } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', subscription.user_id)
        .single();
        
      if (user && user.email) {
        emailQueue.add({
          type: 'subscription_renewal',
          recipient: user.email,
          data: {
            name: user.full_name,
            subscription_id: subscription.id,
            plan_name: subscription.plans?.name || 'Subscription',
            expiry_date: new Date(subscription.current_period_end).toLocaleDateString()
          }
        });
      }
    }
    
    logger.info(`Queued ${subscriptions.length} subscription renewal emails`);
  } catch (error) {
    logger.error('Error in subscription renewal cron job:', error);
  }
});

// Check for document expirations (daily at 1 AM)
cron.schedule('0 1 * * *', async () => {
  try {
    logger.info('Running document expiration check');
    
    // Get documents expiring in 30 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const expiryDateStr = expiryDate.toISOString();
    
    const { data: documents, error } = await supabase
      .from('verification_documents')
      .select('id, verification_id, document_name, expiration_date, verification:verification_id(service_agent_id)')
      .eq('document_status', 'approved')
      .lt('expiration_date', expiryDateStr);
      
    if (error) {
      logger.error('Error fetching expiring documents:', error);
      return;
    }
    
    // Queue document expiration emails
    for (const document of documents) {
      if (!document.verification?.service_agent_id) continue;
      
      // Get service agent email
      const { data: serviceAgent } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', document.verification.service_agent_id)
        .single();
        
      if (serviceAgent && serviceAgent.email) {
        emailQueue.add({
          type: 'document_expiration',
          recipient: serviceAgent.email,
          data: {
            name: serviceAgent.full_name,
            document_name: document.document_name,
            expiry_date: new Date(document.expiration_date).toLocaleDateString()
          }
        });
      }
    }
    
    logger.info(`Queued ${documents.length} document expiration emails`);
  } catch (error) {
    logger.error('Error in document expiration cron job:', error);
  }
});

// Handle queue events
emailQueue.on('completed', job => {
  logger.info(`Email job ${job.id} completed`);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`Email job ${job.id} failed:`, err);
});

bookingQueue.on('completed', job => {
  logger.info(`Booking job ${job.id} completed`);
});

bookingQueue.on('failed', (job, err) => {
  logger.error(`Booking job ${job.id} failed:`, err);
});

subscriptionQueue.on('completed', job => {
  logger.info(`Subscription job ${job.id} completed`);
});

subscriptionQueue.on('failed', (job, err) => {
  logger.error(`Subscription job ${job.id} failed:`, err);
});

notificationQueue.on('completed', job => {
  logger.info(`Notification job ${job.id} completed`);
});

notificationQueue.on('failed', (job, err) => {
  logger.error(`Notification job ${job.id} failed:`, err);
});

logger.info('Worker service started');
