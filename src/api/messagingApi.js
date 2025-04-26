import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getConversations(userId) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        status,
        created_at,
        updated_at,
        booking_id,
        service_id,
        client:client_id(id, first_name, last_name, email, avatar_url),
        service_agent:service_agent_id(id, first_name, last_name, email, avatar_url),
        bookings:booking_id(id, status, service_date, price),
        services:service_id(id, name, description),
        messages:messages(id, sender_id, content, read, created_at)
      `)
      .or(`client_id.eq.${userId},service_agent_id.eq.${userId}`)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    // Process conversations to add additional metadata
    const processedConversations = data.map(conversation => {
      // Get the other participant (not the current user)
      const otherParticipant = conversation.client.id === userId 
        ? conversation.service_agent 
        : conversation.client;
      
      // Get the last message
      const messages = conversation.messages || [];
      const lastMessage = messages.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )[0] || null;
      
      // Count unread messages
      const unreadCount = messages.filter(
        msg => msg.sender_id !== userId && !msg.read
      ).length;
      
      return {
        ...conversation,
        otherParticipant,
        lastMessage,
        unreadCount,
        isClient: conversation.client.id === userId
      };
    });
    
    return processedConversations;
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
}

export async function getConversation(conversationId, userId) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        status,
        created_at,
        updated_at,
        booking_id,
        service_id,
        client:client_id(id, first_name, last_name, email, avatar_url),
        service_agent:service_agent_id(id, first_name, last_name, email, avatar_url),
        bookings:booking_id(id, status, service_date, price),
        services:service_id(id, name, description)
      `)
      .eq('id', conversationId)
      .single();
    
    if (error) throw error;
    
    // Get messages for this conversation
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        content,
        read,
        created_at,
        attachments:message_attachments(id, file_name, file_type, file_size, file_path)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (messagesError) throw messagesError;
    
    // Mark messages as read
    if (messages.some(msg => msg.sender_id !== userId && !msg.read)) {
      await supabase.rpc('mark_messages_as_read', {
        conversation_id: conversationId,
        user_id: userId
      });
    }
    
    // Get the other participant (not the current user)
    const otherParticipant = data.client.id === userId 
      ? data.service_agent 
      : data.client;
    
    return {
      ...data,
      messages,
      otherParticipant,
      isClient: data.client.id === userId
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
}

export async function sendMessage(conversationId, senderId, content, attachments = []) {
  try {
    // Insert message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Upload attachments if any
    if (attachments.length > 0) {
      for (const attachment of attachments) {
        const fileExt = attachment.name.split('.').pop();
        const filePath = `message_attachments/${message.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, attachment);
        
        if (uploadError) throw uploadError;
        
        // Create attachment record
        const { error: attachmentError } = await supabase
          .from('message_attachments')
          .insert({
            message_id: message.id,
            file_name: attachment.name,
            file_type: attachment.type,
            file_size: attachment.size,
            file_path: filePath
          });
        
        if (attachmentError) throw attachmentError;
      }
    }
    
    // Update conversation updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function createConversation(clientId, serviceAgentId, bookingId = null, serviceId = null) {
  try {
    // Check if conversation already exists
    const { data: existingConversation, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .eq('client_id', clientId)
      .eq('service_agent_id', serviceAgentId)
      .eq('booking_id', bookingId || null)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    if (existingConversation) {
      return existingConversation.id;
    }
    
    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        client_id: clientId,
        service_agent_id: serviceAgentId,
        booking_id: bookingId,
        service_id: serviceId
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

export async function getUnreadMessageCount(userId) {
  try {
    const { data, error } = await supabase.rpc('get_unread_message_count', {
      user_id: userId
    });
    
    if (error) throw error;
    
    return data || 0;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }
}

export async function getAttachmentUrl(filePath) {
  try {
    const { data, error } = await supabase.storage
      .from('attachments')
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiry
    
    if (error) throw error;
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting attachment URL:', error);
    throw error;
  }
}
