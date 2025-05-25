# Communication Module

The Communication module handles messaging and notification systems for the FAIT Co-op platform.

## Features

- Conversation list
- Message threads
- Notification system
- Email templates
- SMS messaging
- Real-time updates
- Message history
- Unread message indicators
- File attachments
- Message search

## Directory Structure

```
/communication
  /components
    /messaging     # Messaging components
    /notifications # Notification components
    /sms           # SMS messaging components
    /email         # Email template components
    /attachments   # File attachment components
  /hooks           # Communication-related hooks
  /services        # Communication API services
  /types           # Communication type definitions
  /utils           # Communication utility functions
  /contexts        # Communication context providers
  index.ts         # Public API exports
```

## Usage

Import components and utilities from the Communication module:

```typescript
import { ConversationList } from '@/modules/communication/components/messaging';
import { MessageThread } from '@/modules/communication/components/messaging';
import { NotificationCenter } from '@/modules/communication/components/notifications';
import { SMSMessaging } from '@/modules/communication/components/sms';
```

## Messaging

The Communication module provides components for messaging:

```typescript
import { ConversationList, MessageThread } from '@/modules/communication/components/messaging';

function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  
  return (
    <div className="flex">
      <ConversationList 
        onSelectConversation={setSelectedConversation} 
      />
      {selectedConversation && (
        <MessageThread 
          conversationId={selectedConversation.id} 
        />
      )}
    </div>
  );
}
```

## Notifications

Display and manage notifications:

```typescript
import { NotificationCenter } from '@/modules/communication/components/notifications';

function Header() {
  return (
    <header>
      {/* Other header content */}
      <NotificationCenter />
    </header>
  );
}
```

## SMS Messaging

Send and receive SMS messages:

```typescript
import { SMSMessaging } from '@/modules/communication/components/sms';

function SMSPage() {
  return <SMSMessaging />;
}
```

## Real-time Updates

The Communication module includes hooks for real-time updates:

```typescript
import { useMessageUpdates } from '@/modules/communication/hooks';

function MessageNotifier() {
  const { unreadCount } = useMessageUpdates();
  
  return unreadCount > 0 ? (
    <div className="badge">{unreadCount}</div>
  ) : null;
}
```
