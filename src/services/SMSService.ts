/**
 * Service for managing SMS messages in the database
 */
import { supabase } from '../lib/supabase';
import { telnyxService, type SMSMessage } from './TelnyxService';
import { performanceMonitor } from '../lib/performanceUtils';
import { apiCache } from '../lib/cacheUtils';
import { sanitizeString } from '../lib/securityUtils';

interface SMSConversation {
  id: string;
  userId: string;
  phoneNumber: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SMSTemplate {
  id: string;
  name: string;
  templateText: string;
  isGlobal: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

interface SendSMSOptions {
  userId: string;
  to: string;
  text: string;
  mediaUrls?: string[];
}

interface DBSMSMessage {
  id: string;
  externalId: string;
  userId: string;
  direction: 'inbound' | 'outbound';
  fromNumber: string;
  toNumber: string;
  messageText: string;
  status: string;
  errorMessage?: string;
  mediaUrls?: any;
  metadata?: any;
  sentAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for managing SMS functionality in the database
 */
export class SMSService {
  /**
   * Send an SMS message and store in database
   */
  // @performanceMonitor.createMethodDecorator()('sendSMS')
  async sendSMS({ userId, to, text, mediaUrls }: SendSMSOptions): Promise<DBSMSMessage> {
    try {
      // Sanitize inputs
      const sanitizedText = sanitizeString(text);
      const sanitizedTo = sanitizeString(to);

      // Get user profile to verify permissions
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('id, user_type')
        .eq('id', userId)
        .single();

      if (userError || !userProfile) {
        throw new Error('User not found or unauthorized');
      }

      // Send SMS via Telnyx
      const telnyxMessage = await telnyxService.sendSMS({
        to: sanitizedTo,
        text: sanitizedText,
        mediaUrls
      });

      // Store in database
      const { data: dbMessage, error: dbError } = await supabase
        .from('sms_messages')
        .insert({
          external_id: telnyxMessage.id,
          user_id: userId,
          direction: 'outbound',
          from_number: telnyxMessage.from,
          to_number: sanitizedTo,
          message_text: sanitizedText,
          status: telnyxMessage.status,
          media_urls: mediaUrls ? JSON.stringify(mediaUrls) : null,
          sent_at: telnyxMessage.timestamp
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error storing SMS in database:', dbError);
        throw new Error('Failed to store SMS message');
      }

      // Format the response
      return {
        id: dbMessage.id,
        externalId: dbMessage.external_id,
        userId: dbMessage.user_id,
        direction: dbMessage.direction,
        fromNumber: dbMessage.from_number,
        toNumber: dbMessage.to_number,
        messageText: dbMessage.message_text,
        status: dbMessage.status,
        errorMessage: dbMessage.error_message,
        mediaUrls: dbMessage.media_urls,
        metadata: dbMessage.metadata,
        sentAt: dbMessage.sent_at,
        deliveredAt: dbMessage.delivered_at,
        createdAt: dbMessage.created_at,
        updatedAt: dbMessage.updated_at
      };
    } catch (error) {
      console.error('Error in sendSMS:', error);
      throw error;
    }
  }

  /**
   * Get SMS conversations for a user
   */
  // @performanceMonitor.createMethodDecorator()('getSMSConversations')
  async getSMSConversations(userId: string): Promise<SMSConversation[]> {
    try {
      // Try to get from cache first
      const cacheKey = `sms:conversations:${userId}`;
      const cachedConversations = apiCache.get<SMSConversation[]>(cacheKey);

      if (cachedConversations) {
        return cachedConversations;
      }

      // Get from database
      const { data: conversations, error } = await supabase
        .from('sms_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error getting SMS conversations:', error);
        throw new Error('Failed to get SMS conversations');
      }

      // Format the response
      const formattedConversations: SMSConversation[] = conversations.map(conv => ({
        id: conv.id,
        userId: conv.user_id,
        phoneNumber: conv.phone_number,
        lastMessageText: conv.last_message_text,
        lastMessageAt: conv.last_message_at,
        unreadCount: conv.unread_count,
        isActive: conv.is_active,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at
      }));

      // Cache the result
      apiCache.set(cacheKey, formattedConversations, { expiresIn: 30 * 1000 }); // 30 seconds

      return formattedConversations;
    } catch (error) {
      console.error('Error in getSMSConversations:', error);
      throw error;
    }
  }

  /**
   * Get SMS messages for a conversation
   */
  // @performanceMonitor.createMethodDecorator()('getSMSMessages')
  async getSMSMessages(userId: string, phoneNumber: string, limit = 50): Promise<DBSMSMessage[]> {
    try {
      // Sanitize phone number
      const sanitizedPhone = sanitizeString(phoneNumber);

      // Get messages from database
      const { data: messages, error } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('user_id', userId)
        .or(`from_number.eq.${sanitizedPhone},to_number.eq.${sanitizedPhone}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting SMS messages:', error);
        throw new Error('Failed to get SMS messages');
      }

      // Format the response
      return messages.map(msg => ({
        id: msg.id,
        externalId: msg.external_id,
        userId: msg.user_id,
        direction: msg.direction,
        fromNumber: msg.from_number,
        toNumber: msg.to_number,
        messageText: msg.message_text,
        status: msg.status,
        errorMessage: msg.error_message,
        mediaUrls: msg.media_urls,
        metadata: msg.metadata,
        sentAt: msg.sent_at,
        deliveredAt: msg.delivered_at,
        createdAt: msg.created_at,
        updatedAt: msg.updated_at
      }));
    } catch (error) {
      console.error('Error in getSMSMessages:', error);
      throw error;
    }
  }

  /**
   * Mark a conversation as read
   */
  // @performanceMonitor.createMethodDecorator()('markConversationAsRead')
  async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      // Call the database function
      const { error } = await supabase
        .rpc('mark_sms_conversation_read', { conversation_id: conversationId });

      if (error) {
        console.error('Error marking conversation as read:', error);
        throw new Error('Failed to mark conversation as read');
      }

      // Clear cache for this user's conversations
      const { data: conversation, error: convError } = await supabase
        .from('sms_conversations')
        .select('user_id')
        .eq('id', conversationId)
        .single();

      if (!convError && conversation) {
        apiCache.remove(`sms:conversations:${conversation.user_id}`);
      }
    } catch (error) {
      console.error('Error in markConversationAsRead:', error);
      throw error;
    }
  }

  /**
   * Get SMS templates
   */
  // @performanceMonitor.createMethodDecorator()('getSMSTemplates')
  async getSMSTemplates(userId: string): Promise<SMSTemplate[]> {
    try {
      // Get templates from database (global + user's own)
      const { data: templates, error } = await supabase
        .from('sms_templates')
        .select('*')
        .or(`is_global.eq.true,user_id.eq.${userId}`)
        .order('name');

      if (error) {
        console.error('Error getting SMS templates:', error);
        throw new Error('Failed to get SMS templates');
      }

      // Format the response
      return templates.map(tpl => ({
        id: tpl.id,
        name: tpl.name,
        templateText: tpl.template_text,
        isGlobal: tpl.is_global,
        userId: tpl.user_id,
        createdAt: tpl.created_at,
        updatedAt: tpl.updated_at
      }));
    } catch (error) {
      console.error('Error in getSMSTemplates:', error);
      throw error;
    }
  }

  /**
   * Create a new SMS template
   */
  // @performanceMonitor.createMethodDecorator()('createSMSTemplate')
  async createSMSTemplate(userId: string, name: string, templateText: string): Promise<SMSTemplate> {
    try {
      // Sanitize inputs
      const sanitizedName = sanitizeString(name);
      const sanitizedText = sanitizeString(templateText);

      // Create template in database
      const { data: template, error } = await supabase
        .from('sms_templates')
        .insert({
          name: sanitizedName,
          template_text: sanitizedText,
          is_global: false,
          user_id: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating SMS template:', error);
        throw new Error('Failed to create SMS template');
      }

      // Format the response
      return {
        id: template.id,
        name: template.name,
        templateText: template.template_text,
        isGlobal: template.is_global,
        userId: template.user_id,
        createdAt: template.created_at,
        updatedAt: template.updated_at
      };
    } catch (error) {
      console.error('Error in createSMSTemplate:', error);
      throw error;
    }
  }

  /**
   * Process an incoming SMS webhook
   * This would be called by a webhook handler
   */
  // @performanceMonitor.createMethodDecorator()('processIncomingSMS')
  async processIncomingSMS(webhookData: any): Promise<void> {
    try {
      // Extract message data from webhook
      const payload = webhookData.data?.payload;
      if (!payload || payload.event_type !== 'message.received') {
        return; // Not a message received event
      }

      const message = payload.payload;
      const fromNumber = message.from.phone_number;
      const toNumber = message.to[0].phone_number;
      const text = message.text;
      const mediaUrls = message.media?.map(m => m.url) || [];

      // Find the user this message is for
      // In a real implementation, you might need to look up which user this phone number belongs to
      // For now, we'll find the most recent conversation with this phone number
      const { data: conversation, error: convError } = await supabase
        .from('sms_conversations')
        .select('user_id')
        .eq('phone_number', fromNumber)
        .order('last_message_at', { ascending: false })
        .limit(1)
        .single();

      if (convError || !conversation) {
        console.error('Could not determine user for incoming SMS:', fromNumber);
        return;
      }

      // Store the message in the database
      const { error: msgError } = await supabase
        .from('sms_messages')
        .insert({
          external_id: message.id,
          user_id: conversation.user_id,
          direction: 'inbound',
          from_number: fromNumber,
          to_number: toNumber,
          message_text: text,
          status: 'delivered',
          media_urls: mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
          delivered_at: new Date().toISOString()
        });

      if (msgError) {
        console.error('Error storing incoming SMS:', msgError);
      }

      // Clear cache for this user's conversations
      apiCache.remove(`sms:conversations:${conversation.user_id}`);

      // TODO: Implement notification system for new messages
    } catch (error) {
      console.error('Error processing incoming SMS webhook:', error);
    }
  }
}

// Create a singleton instance
export const smsService = new SMSService();
