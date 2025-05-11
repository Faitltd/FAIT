import { Profile } from './user';

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  
  // Joined fields
  sender?: Profile;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title?: string;
  participants: string[];
  last_message_at: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  messages?: Message[];
  unread_count?: number;
  participant_profiles?: Profile[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url?: string;
  related_id?: string;
  related_type?: string;
  created_at: string;
}
