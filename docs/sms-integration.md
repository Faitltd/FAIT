# SMS Integration Documentation

This document provides an overview of the SMS integration in the FAIT Co-Op Platform using Telnyx.

## Overview

The FAIT Co-Op Platform integrates with Telnyx to provide SMS messaging capabilities. This allows users to send and receive SMS messages directly from the platform, enabling better communication between clients and service agents.

## Setup

### Prerequisites

1. A Telnyx account
2. A phone number purchased from Telnyx with SMS capabilities
3. Telnyx API key

### Environment Variables

The following environment variables need to be set:

```
VITE_TELNYX_API_KEY=your_telnyx_api_key
VITE_TELNYX_PHONE_NUMBER=+12702035866
```

### Database Setup

The SMS functionality requires the following database tables:

1. `sms_messages` - Stores all SMS messages
2. `sms_conversations` - Groups messages into conversations
3. `sms_templates` - Stores message templates for quick sending

The database migration file `20240501000000_add_sms_tables.sql` contains the necessary SQL to create these tables.

## Architecture

### Components

1. **TelnyxService** - Service for interacting with the Telnyx API
2. **SMSService** - Service for managing SMS messages in the database
3. **SMS Webhook Handler** - Edge function for handling incoming SMS webhooks
4. **UI Components** - React components for the SMS interface

### Data Flow

1. **Sending Messages**:
   - User composes a message in the UI
   - Message is sent to the Telnyx API via `TelnyxService`
   - Message is stored in the database via `SMSService`
   - UI is updated to show the sent message

2. **Receiving Messages**:
   - Telnyx sends a webhook to the SMS webhook handler
   - Webhook handler processes the message and stores it in the database
   - UI polls for new messages and updates when new messages are received

## Webhook Configuration

To receive incoming SMS messages, you need to configure a webhook in your Telnyx account:

1. Go to the Telnyx Portal > Messaging > Webhooks
2. Add a new webhook with the URL of your deployed webhook handler:
   - For production: `https://your-domain.com/api/sms-webhook`
   - For development: Use a service like ngrok to expose your local webhook

## Usage

### Sending SMS

```typescript
import { smsService } from '../services/SMSService';

// Send an SMS message
await smsService.sendSMS({
  userId: 'user-id',
  to: '+1234567890',
  text: 'Hello from FAIT Co-Op!',
  mediaUrls: ['https://example.com/image.jpg'] // Optional
});
```

### Getting Conversations

```typescript
import { smsService } from '../services/SMSService';

// Get all conversations for a user
const conversations = await smsService.getSMSConversations('user-id');
```

### Getting Messages

```typescript
import { smsService } from '../services/SMSService';

// Get messages for a conversation
const messages = await smsService.getSMSMessages('user-id', '+1234567890');
```

## UI Components

The SMS functionality includes the following UI components:

1. **SMSConversationList** - Displays a list of conversations
2. **SMSConversation** - Displays messages in a conversation and allows sending new messages
3. **SMSTemplateManager** - Manages message templates

These components are used in the `SMSMessagingPage` which is accessible at `/messaging/sms`.

## Security Considerations

1. **API Key Security**: The Telnyx API key is stored as an environment variable and should never be exposed to the client.
2. **Row Level Security**: Database tables have RLS policies to ensure users can only access their own data.
3. **Input Sanitization**: All user input is sanitized before being sent to the API or stored in the database.
4. **Rate Limiting**: API calls are rate limited to prevent abuse.

## Limitations

1. **Media Messages**: While the system supports media messages, there are size and format limitations imposed by Telnyx.
2. **International SMS**: International SMS may have different pricing and regulations.
3. **Message Length**: SMS messages are limited to 160 characters per segment.

## Troubleshooting

### Common Issues

1. **Messages not sending**: Check the Telnyx API key and ensure the phone number is active.
2. **Webhook not receiving messages**: Verify the webhook URL is correctly configured in Telnyx.
3. **Database errors**: Check the database migration has been applied correctly.

### Debugging

1. Check the browser console for client-side errors
2. Check the server logs for API errors
3. Check the Telnyx dashboard for message delivery status

## Future Improvements

1. **Message Scheduling**: Allow scheduling messages for future delivery
2. **Automated Responses**: Set up automated responses based on keywords
3. **Analytics**: Track message delivery rates and response times
4. **Group Messaging**: Support for sending messages to multiple recipients
