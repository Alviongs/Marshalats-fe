import { TokenManager } from './tokenManager'

export interface PaymentNotification {
  id: string
  payment_id: string
  student_id: string
  notification_type: string
  title: string
  message: string
  amount?: number
  course_name?: string
  branch_name?: string
  is_read: boolean
  priority: string
  created_at: string
  read_at?: string
}

export interface NotificationResponse {
  notifications: PaymentNotification[]
  total: number
  unread_count: number
}

class NotificationAPI {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8003'
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = TokenManager.getToken()
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async getPaymentNotifications(skip: number = 0, limit: number = 50): Promise<PaymentNotification[]> {
    try {
      const data = await this.makeRequest(`/api/payments/notifications?skip=${skip}&limit=${limit}`)
      return data || []
    } catch (error) {
      console.error('Error fetching payment notifications:', error)
      throw error
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await this.makeRequest(`/api/payments/notifications/${notificationId}/read`, {
        method: 'PUT'
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getPaymentNotifications(0, 100)
      return notifications.filter(n => !n.is_read).length
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }
}

export const notificationAPI = new NotificationAPI()
