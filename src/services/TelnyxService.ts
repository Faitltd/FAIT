/**
 * Service for interacting with the Telnyx API for SMS functionality
 */
import { performanceMonitor } from '../lib/performanceUtils';
import { apiCache } from '../lib/cacheUtils';
import { sanitizeString } from '../lib/securityUtils';

// Environment variables would be used in production
const TELNYX_API_KEY = import.meta.env.VITE_TELNYX_API_KEY || '';
const TELNYX_PHONE_NUMBER = '+12702035866'; // The phone number we purchased

interface SendSMSParams {
  to: string;
  text: string;
  from?: string;
  webhookUrl?: string;
  mediaUrls?: string[];
}

interface SMSMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  from: string;
  to: string;
  text: string;
  media?: { url: string; contentType: string; hashSha256: string }[];
  timestamp: string;
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'failed';
  errorMessage?: string;
}

/**
 * Service for handling SMS functionality via Telnyx
 */
export class TelnyxService {
  private baseUrl = 'https://api.telnyx.com/v2';
  private defaultFrom = TELNYX_PHONE_NUMBER;

  /**
   * Send an SMS message
   */
  // @performanceMonitor.createMethodDecorator()('sendSMS')
  async sendSMS({
    to,
    text,
    from = this.defaultFrom,
    webhookUrl,
    mediaUrls
  }: SendSMSParams): Promise<SMSMessage> {
    try {
      // Sanitize inputs
      const sanitizedText = sanitizeString(text);
      const sanitizedTo = sanitizeString(to);

      // Validate phone number format
      if (!this.isValidPhoneNumber(sanitizedTo)) {
        throw new Error('Invalid recipient phone number format');
      }

      // Prepare request body
      const body: Record<string, any> = {
        from,
        to: sanitizedTo,
        text: sanitizedText,
      };

      // Add optional parameters if provided
      if (webhookUrl) {
        body.webhook_url = webhookUrl;
      }

      if (mediaUrls && mediaUrls.length > 0) {
        body.media_urls = mediaUrls;
      }

      // Make API request
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${TELNYX_API_KEY}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.detail || 'Failed to send SMS');
      }

      const data = await response.json();

      // Format the response
      return {
        id: data.data.id,
        direction: 'outbound',
        from,
        to: sanitizedTo,
        text: sanitizedText,
        media: mediaUrls ? mediaUrls.map(url => ({ url, contentType: 'image/jpeg', hashSha256: '' })) : undefined,
        timestamp: new Date().toISOString(),
        status: data.data.status
      };
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  /**
   * Get SMS message by ID
   */
  // @performanceMonitor.createMethodDecorator()('getSMSMessage')
  async getSMSMessage(messageId: string): Promise<SMSMessage> {
    try {
      // Try to get from cache first
      const cacheKey = `sms:message:${messageId}`;
      const cachedMessage = apiCache.get<SMSMessage>(cacheKey);

      if (cachedMessage) {
        return cachedMessage;
      }

      // Make API request
      const response = await fetch(`${this.baseUrl}/messages/${messageId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${TELNYX_API_KEY}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.detail || 'Failed to get SMS message');
      }

      const data = await response.json();

      // Format the response
      const message: SMSMessage = {
        id: data.data.id,
        direction: data.data.direction,
        from: data.data.from.phone_number,
        to: data.data.to[0].phone_number,
        text: data.data.text,
        media: data.data.media?.map(m => ({
          url: m.url,
          contentType: m.content_type,
          hashSha256: m.hash_sha256
        })),
        timestamp: data.data.sent_at || data.data.received_at,
        status: data.data.status
      };

      // Cache the result
      apiCache.set(cacheKey, message, { expiresIn: 5 * 60 * 1000 }); // 5 minutes

      return message;
    } catch (error) {
      console.error('Error getting SMS message:', error);
      throw error;
    }
  }

  /**
   * Get SMS messages for a user
   */
  // @performanceMonitor.createMethodDecorator()('getUserSMSMessages')
  async getUserSMSMessages(phoneNumber: string, limit = 20): Promise<SMSMessage[]> {
    try {
      // Sanitize and validate phone number
      const sanitizedPhone = sanitizeString(phoneNumber);
      if (!this.isValidPhoneNumber(sanitizedPhone)) {
        throw new Error('Invalid phone number format');
      }

      // Make API request
      const response = await fetch(
        `${this.baseUrl}/messages?filter[from.phone_number]=${encodeURIComponent(sanitizedPhone)}&filter[to.phone_number]=${encodeURIComponent(this.defaultFrom)}&page[size]=${limit}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${TELNYX_API_KEY}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.detail || 'Failed to get SMS messages');
      }

      const data = await response.json();

      // Format the response
      const messages: SMSMessage[] = data.data.map(msg => ({
        id: msg.id,
        direction: msg.direction,
        from: msg.from.phone_number,
        to: msg.to[0].phone_number,
        text: msg.text,
        media: msg.media?.map(m => ({
          url: m.url,
          contentType: m.content_type,
          hashSha256: m.hash_sha256
        })),
        timestamp: msg.sent_at || msg.received_at,
        status: msg.status
      }));

      return messages;
    } catch (error) {
      console.error('Error getting user SMS messages:', error);
      throw error;
    }
  }

  /**
   * Validate phone number format
   * Basic validation for E.164 format
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }
}

// Create a singleton instance
export const telnyxService = new TelnyxService();
