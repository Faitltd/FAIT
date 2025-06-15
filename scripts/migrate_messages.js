import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateMessages() {
  console.log('Starting message migration...');
  
  try {
    // 1. Get all bookings with messages
    console.log('Fetching bookings with messages...');
    const { data: bookingsWithMessages, error: bookingsError } = await supabase
      .from('messages')
      .select('booking_id')
      .is('booking_id', 'not.null')
      .order('booking_id')
      .limit(1000);
    
    if (bookingsError) throw bookingsError;
    
    // Get unique booking IDs
    const uniqueBookingIds = [...new Set(bookingsWithMessages.map(m => m.booking_id))];
    console.log(`Found ${uniqueBookingIds.length} bookings with messages`);
    
    // 2. For each booking, create a conversation and migrate messages
    for (const bookingId of uniqueBookingIds) {
      console.log(`Processing booking ${bookingId}...`);
      
      // Get booking details
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id,
          client_id,
          service_agent_id,
          contractor_id,
          service_package:service_packages (title)
        `)
        .eq('id', bookingId)
        .single();
      
      if (bookingError) {
        console.error(`Error fetching booking ${bookingId}:`, bookingError);
        continue;
      }
      
      // Determine the participants
      const serviceProviderId = booking.service_agent_id || booking.contractor_id;
      if (!booking.client_id || !serviceProviderId) {
        console.error(`Booking ${bookingId} is missing client_id or service provider ID`);
        continue;
      }
      
      // Create conversation title
      const conversationTitle = `Booking: ${booking.service_package?.title || 'Service'}`;
      
      // Create conversation
      const { data: conversationId, error: conversationError } = await supabase.rpc(
        'create_conversation',
        {
          user1_id: booking.client_id,
          user2_id: serviceProviderId,
          conversation_title: conversationTitle
        }
      );
      
      if (conversationError) {
        console.error(`Error creating conversation for booking ${bookingId}:`, conversationError);
        continue;
      }
      
      console.log(`Created conversation ${conversationId} for booking ${bookingId}`);
      
      // Get messages for this booking
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at');
      
      if (messagesError) {
        console.error(`Error fetching messages for booking ${bookingId}:`, messagesError);
        continue;
      }
      
      console.log(`Migrating ${messages.length} messages for booking ${bookingId}...`);
      
      // Migrate messages
      for (const message of messages) {
        const { error: insertError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: message.sender_id,
            content: message.content,
            is_read: true, // Mark all migrated messages as read
            created_at: message.created_at
          });
        
        if (insertError) {
          console.error(`Error migrating message ${message.id}:`, insertError);
        }
      }
      
      console.log(`Successfully migrated ${messages.length} messages for booking ${bookingId}`);
    }
    
    console.log('Message migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

migrateMessages();
