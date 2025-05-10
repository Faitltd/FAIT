import { User } from '../../core/types/common';

/**
 * Message status
 */
export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

/**
 * Message type
 */
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system'
}

/**
 * Message interface
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: User;
  content: string;
  type: MessageType;
  status: MessageStatus;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Conversation status
 */
export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

/**
 * Conversation interface
 */
export interface Conversation {
  id: string;
  title?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Attachment type
 */
export enum AttachmentType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other'
}

/**
 * Attachment interface
 */
export interface Attachment {
  id: string;
  messageId: string;
  name: string;
  type: AttachmentType;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

/**
 * Notification type
 */
export enum NotificationType {
  MESSAGE = 'message',
  BOOKING = 'booking',
  PROJECT = 'project',
  PAYMENT = 'payment',
  SYSTEM = 'system'
}

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

/**
 * Email template type
 */
export enum EmailTemplateType {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  BOOKING_CONFIRMATION = 'booking_confirmation',
  BOOKING_REMINDER = 'booking_reminder',
  PAYMENT_RECEIPT = 'payment_receipt',
  PROJECT_UPDATE = 'project_update',
  ESTIMATE = 'estimate'
}

/**
 * Email template interface
 */
export interface EmailTemplate {
  id: string;
  type: EmailTemplateType;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * SMS template type
 */
export enum SMSTemplateType {
  WELCOME = 'welcome',
  VERIFICATION = 'verification',
  BOOKING_CONFIRMATION = 'booking_confirmation',
  BOOKING_REMINDER = 'booking_reminder',
  PAYMENT_RECEIPT = 'payment_receipt',
  PROJECT_UPDATE = 'project_update'
}

/**
 * SMS template interface
 */
export interface SMSTemplate {
  id: string;
  type: SMSTemplateType;
  name: string;
  body: string;
  variables: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
