// API utility functions for dashboard data management
import { BaseAPI } from './baseAPI'

export interface DashboardStats {
  active_students: number
  total_users: number
  active_courses: number
  monthly_active_users: number
  active_enrollments: number
  total_revenue: number
  monthly_revenue: number
  pending_payments: number
  today_attendance: number
}

export interface DashboardStatsResponse {
  dashboard_stats: DashboardStats
}

export interface RecentActivity {
  recent_enrollments: any[]
  recent_payments: any[]
}

export interface Coach {
  id: string
  personal_info: {
    first_name: string
    last_name: string
    gender: string
    date_of_birth: string
  }
  contact_info: {
    email: string
    country_code: string
    phone: string
  }
  areas_of_expertise: string[]
  full_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CoachesResponse {
  coaches: Coach[]
  total: number
}

class DashboardAPI extends BaseAPI {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(token: string, branchId?: string): Promise<DashboardStatsResponse> {
    let endpoint = '/api/dashboard/stats'
    if (branchId) {
      endpoint += `?branch_id=${branchId}`
    }
    
    return await this.makeRequest(endpoint, {
      method: 'GET',
      token
    })
  }

  /**
   * Get recent activities for dashboard
   */
  async getRecentActivities(token: string, limit: number = 10): Promise<RecentActivity> {
    return await this.makeRequest(`/api/dashboard/recent-activities?limit=${limit}`, {
      method: 'GET',
      token
    })
  }

  /**
   * Get coaches list for dashboard
   */
  async getCoaches(token: string, params?: {
    skip?: number
    limit?: number
    active_only?: boolean
    area_of_expertise?: string
  }): Promise<CoachesResponse> {
    let endpoint = '/api/coaches'
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
      if (searchParams.toString()) {
        endpoint += `?${searchParams.toString()}`
      }
    }

    return await this.makeRequest(endpoint, {
      method: 'GET',
      token
    })
  }

  /**
   * Get coach statistics
   */
  async getCoachStats(token: string): Promise<any> {
    return await this.makeRequest('/api/coaches/stats/overview', {
      method: 'GET',
      token
    })
  }

  /**
   * Get course statistics
   */
  async getCourseStats(token: string, courseId: string): Promise<any> {
    return await this.makeRequest(`/api/courses/${courseId}/stats`, {
      method: 'GET',
      token
    })
  }

  /**
   * Get all courses for dashboard metrics
   */
  async getCourses(token: string): Promise<any> {
    return await this.makeRequest('/api/courses', {
      method: 'GET',
      token
    })
  }

  /**
   * Get public courses (no authentication required)
   */
  async getPublicCourses(params?: {
    active_only?: boolean
    skip?: number
    limit?: number
  }): Promise<any> {
    let endpoint = '/api/courses/public/all'
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
      if (searchParams.toString()) {
        endpoint += `?${searchParams.toString()}`
      }
    }

    return await this.makeRequest(endpoint, {
      method: 'GET'
    })
  }

  /**
   * Get users/students for dashboard metrics
   */
  async getUsers(token: string, params?: {
    role?: string
    branch_id?: string
    skip?: number
    limit?: number
  }): Promise<any> {
    let endpoint = '/api/users'
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
      if (searchParams.toString()) {
        endpoint += `?${searchParams.toString()}`
      }
    }

    return await this.makeRequest(endpoint, {
      method: 'GET',
      token
    })
  }

  /**
   * Get student details with course enrollment data
   */
  async getStudentDetails(token: string): Promise<any> {
    return await this.makeRequest('/api/users/students/details', {
      method: 'GET',
      token
    })
  }
}

export const dashboardAPI = new DashboardAPI()
