import { BaseAPI } from './baseAPI'
import { TokenManager } from './tokenManager'
import { BranchManagerAuth } from './branchManagerAuth'

// Message-related interfaces
export interface MessageParticipant {
  user_id: string
  user_type: 'student' | 'coach' | 'branch_manager' | 'superadmin'
  user_name: string
  user_email: string
  branch_id?: string
}

export interface MessageAttachment {
  id: string
  filename: string
  file_type: string
  file_size: number
  file_url: string
  uploaded_at: string
}

export interface Message {
  id: string
  thread_id?: string
  sender_name: string
  sender_type: 'student' | 'coach' | 'branch_manager' | 'superadmin'
  recipient_name: string
  recipient_type: 'student' | 'coach' | 'branch_manager' | 'superadmin'
  subject: string
  content: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'sent' | 'delivered' | 'read' | 'archived' | 'deleted'
  is_read: boolean
  is_archived: boolean
  is_reply: boolean
  reply_to_message_id?: string
  attachments?: MessageAttachment[]
  created_at: string
  updated_at: string
  read_at?: string
}

export interface Conversation {
  thread_id: string
  subject: string
  participants: MessageParticipant[]
  message_count: number
  last_message?: Message
  last_message_at?: string
  unread_count: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface MessageStats {
  total_messages: number
  unread_messages: number
  sent_messages: number
  received_messages: number
  archived_messages: number
  deleted_messages: number
  active_conversations: number
}

export interface MessageRecipient {
  id: string
  name: string
  email: string
  type: 'student' | 'coach' | 'branch_manager' | 'superadmin'
  branch_id?: string
}

export interface MessageNotification {
  id: string
  message_id: string
  thread_id: string
  recipient_id: string
  recipient_type: string
  sender_id: string
  sender_name: string
  sender_type: string
  notification_type: string
  title: string
  message: string
  subject: string
  is_read: boolean
  priority: string
  created_at: string
  read_at?: string
}

export interface SendMessageRequest {
  recipient_id: string
  recipient_type: 'student' | 'coach' | 'branch_manager' | 'superadmin'
  subject: string
  content: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  reply_to_message_id?: string
  thread_id?: string
  attachments?: any[]
}

export interface UpdateMessageRequest {
  is_read?: boolean
  is_archived?: boolean
  is_deleted?: boolean
  status?: 'sent' | 'delivered' | 'read' | 'archived' | 'deleted'
}

export interface ConversationsResponse {
  conversations: Conversation[]
  total_count: number
  skip: number
  limit: number
}

export interface ThreadMessagesResponse {
  messages: Message[]
  thread: any
  total_count: number
  skip: number
  limit: number
}

export interface RecipientsResponse {
  recipients: MessageRecipient[]
  total_count: number
}

class MessageAPI extends BaseAPI {
  
  /**
   * Get authentication headers based on user type
   */
  private getAuthHeaders(): Record<string, string> {
    // Try different authentication methods
    const tokenManagerToken = TokenManager.getToken()
    if (tokenManagerToken) {
      return {
        'Authorization': `Bearer ${tokenManagerToken}`,
        'Content-Type': 'application/json'
      }
    }
    
    const branchManagerToken = BranchManagerAuth.getToken()
    if (branchManagerToken) {
      return {
        'Authorization': `Bearer ${branchManagerToken}`,
        'Content-Type': 'application/json'
      }
    }
    
    // Fallback to environment token
    const envToken = process.env.NEXT_PUBLIC_AUTH_TOKEN
    if (envToken) {
      return {
        'Authorization': `Bearer ${envToken}`,
        'Content-Type': 'application/json'
      }
    }
    
    return {
      'Content-Type': 'application/json'
    }
  }

  /**
   * Send a new message
   */
  async sendMessage(messageData: SendMessageRequest): Promise<{ message: string; message_id: string; thread_id: string }> {
    return await this.makeRequest('/api/messages/send', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: messageData
    })
  }

  /**
   * Get user's conversations
   */
  async getConversations(skip: number = 0, limit: number = 50): Promise<ConversationsResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString()
    })
    
    return await this.makeRequest(`/api/messages/conversations?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
  }

  /**
   * Get messages in a specific thread
   */
  async getThreadMessages(threadId: string, skip: number = 0, limit: number = 50): Promise<ThreadMessagesResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString()
    })
    
    return await this.makeRequest(`/api/messages/thread/${threadId}/messages?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
  }

  /**
   * Update message status
   */
  async updateMessage(messageId: string, updateData: UpdateMessageRequest): Promise<{ message: string }> {
    return await this.makeRequest(`/api/messages/message/${messageId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: updateData
    })
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: string): Promise<{ message: string }> {
    return await this.makeRequest(`/api/messages/message/${messageId}/mark-read`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    })
  }

  /**
   * Archive message
   */
  async archiveMessage(messageId: string): Promise<{ message: string }> {
    return await this.makeRequest(`/api/messages/message/${messageId}/archive`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    })
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<{ message: string }> {
    return await this.makeRequest(`/api/messages/message/${messageId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
  }

  /**
   * Get message statistics
   */
  async getMessageStats(): Promise<{ stats: MessageStats }> {
    return await this.makeRequest('/api/messages/stats', {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
  }

  /**
   * Get available recipients
   */
  async getAvailableRecipients(): Promise<RecipientsResponse> {
    return await this.makeRequest('/api/messages/recipients', {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<{ unread_count: number }> {
    return await this.makeRequest('/api/messages/unread-count', {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
  }

  /**
   * Get messageable students (for coaches, branch managers, superadmin)
   */
  async getMessageableStudents(branchId?: string): Promise<{ students: MessageRecipient[]; total_count: number }> {
    const params = branchId ? `?branch_id=${branchId}` : ''
    return await this.makeRequest(`/api/messages/students${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
  }

  /**
   * Get messageable coaches (for students, branch managers, superadmin)
   */
  async getMessageableCoaches(branchId?: string): Promise<{ coaches: MessageRecipient[]; total_count: number }> {
    const params = branchId ? `?branch_id=${branchId}` : ''
    return await this.makeRequest(`/api/messages/coaches${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
  }

  /**
   * Get messageable branch managers (for students, coaches, superadmin)
   */
  async getMessageableBranchManagers(): Promise<{ branch_managers: MessageRecipient[]; total_count: number }> {
    return await this.makeRequest('/api/messages/branch-managers', {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
  }

  /**
   * Get messageable superadmins (for students, coaches, branch managers)
   */
  async getMessageableSuperadmins(): Promise<{ superadmins: MessageRecipient[]; total_count: number }> {
    return await this.makeRequest('/api/messages/superadmins', {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
  }

  /**
   * Get message notifications for the current user
   */
  async getMessageNotifications(skip: number = 0, limit: number = 50): Promise<{ notifications: MessageNotification[]; total: number; unread_count: number }> {
    return await this.makeRequest(`/api/messages/notifications?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
  }

  /**
   * Mark a message notification as read
   */
  async markMessageNotificationAsRead(notificationId: string): Promise<{ message: string }> {
    return await this.makeRequest(`/api/messages/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    })
  }

  /**
   * Get unread message notification count
   */
  async getUnreadMessageNotificationCount(): Promise<number> {
    try {
      const response = await this.getMessageNotifications(0, 1)
      return response.unread_count
    } catch (error) {
      console.error('Error getting unread message notification count:', error)
      return 0
    }
  }
}

// Export singleton instance
export const messageAPI = new MessageAPI()
export default messageAPI
