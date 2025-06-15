import { apiService } from '../../core/services/apiService';
import { 
  Message, 
  Conversation, 
  Notification,
  MessageType,
  Attachment,
  AttachmentType
} from '../types/communication';
import { ApiResponse, PaginatedResult, QueryParams } from '../../core/types/common';

/**
 * Communication service for managing messages and conversations
 */
class CommunicationService {
  private baseEndpoint = '/communications';

  /**
   * Get all conversations
   */
  async getConversations(params?: QueryParams): Promise<ApiResponse<PaginatedResult<Conversation>>> {
    return apiService.get<PaginatedResult<Conversation>>(`${this.baseEndpoint}/conversations`, params);
  }

  /**
   * Get a conversation by ID
   */
  async getConversation(id: string): Promise<ApiResponse<Conversation>> {
    return apiService.get<Conversation>(`${this.baseEndpoint}/conversations/${id}`);
  }

  /**
   * Create a new conversation
   */
  async createConversation(participantIds: string[], title?: string): Promise<ApiResponse<Conversation>> {
    return apiService.post<Conversation>(`${this.baseEndpoint}/conversations`, {
      participantIds,
      title
    });
  }

  /**
   * Update a conversation
   */
  async updateConversation(id: string, data: Partial<Conversation>): Promise<ApiResponse<Conversation>> {
    return apiService.put<Conversation>(`${this.baseEndpoint}/conversations/${id}`, data);
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(id: string): Promise<ApiResponse<Conversation>> {
    return apiService.post<Conversation>(`${this.baseEndpoint}/conversations/${id}/archive`, {});
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/conversations/${id}`);
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string,
    params?: QueryParams
  ): Promise<ApiResponse<PaginatedResult<Message>>> {
    return apiService.get<PaginatedResult<Message>>(
      `${this.baseEndpoint}/conversations/${conversationId}/messages`,
      params
    );
  }

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    content: string,
    type: MessageType = MessageType.TEXT
  ): Promise<ApiResponse<Message>> {
    return apiService.post<Message>(`${this.baseEndpoint}/conversations/${conversationId}/messages`, {
      content,
      type
    });
  }

  /**
   * Send a message with attachment
   */
  async sendMessageWithAttachment(
    conversationId: string,
    content: string,
    file: File,
    type: AttachmentType
  ): Promise<ApiResponse<Message>> {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('file', file);
    formData.append('type', type);

    return apiService.uploadFile<Message>(
      `${this.baseEndpoint}/conversations/${conversationId}/messages/attachment`,
      file,
      { content, type }
    );
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, messageIds: string[]): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseEndpoint}/conversations/${conversationId}/read`, {
      messageIds
    });
  }

  /**
   * Get all notifications
   */
  async getNotifications(params?: QueryParams): Promise<ApiResponse<PaginatedResult<Notification>>> {
    return apiService.get<PaginatedResult<Notification>>(`${this.baseEndpoint}/notifications`, params);
  }

  /**
   * Mark notifications as read
   */
  async markNotificationsAsRead(notificationIds: string[]): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseEndpoint}/notifications/read`, {
      notificationIds
    });
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/notifications/${id}`);
  }

  /**
   * Get unread counts
   */
  async getUnreadCounts(): Promise<ApiResponse<{ messages: number; notifications: number }>> {
    return apiService.get<{ messages: number; notifications: number }>(
      `${this.baseEndpoint}/unread-counts`
    );
  }
}

// Create and export a singleton instance
export const communicationService = new CommunicationService();
