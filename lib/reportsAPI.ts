import { BaseAPI } from './baseAPI'
import {
  validateApiResponse,
  validateObject,
  reportFiltersSchema,
  sanitizeString,
  sanitizeObject,
  safeGet,
  isString,
  isObject,
  isArray
} from './validation'
import { toast } from 'sonner'

// Enhanced interface with validation
export interface ReportFilters {
  start_date?: string
  end_date?: string
  branch_id?: string
  session?: string
  class?: string
  section?: string
  fees_type?: string
  course_id?: string
  category_id?: string
  date_range?: string
  status?: string
}

export interface FinancialReportData {
  total_balance_fees_statement: {
    total_amount: number
    total_transactions: number
  }
  balance_fees_statement: {
    pending_amount: number
    pending_transactions: number
  }
  daily_collection_report: Array<{
    _id: string
    total: number
    count: number
  }>
  type_wise_balance_report: Array<{
    _id: string
    total: number
    count: number
  }>
  fees_statement: Array<{
    _id: string
    total: number
    count: number
    branch_info: {
      name: string
      location: string
    }
  }>
  total_fee_collection_report: Array<{
    _id: string
    total: number
    count: number
  }>
  other_fees_collection_report: Array<{
    _id: string
    total: number
    count: number
  }>
  online_fees_collection_report: Array<{
    _id: string
    total: number
    count: number
  }>
  balance_fees_report_with_remark: Array<{
    amount: number
    due_date: string
    notes: string
    student_name: string
    student_email: string
  }>
}

export interface StudentReportData {
  enrollment_statistics: Array<{
    _id: string
    total_students: number
    course_info: {
      title: string
      code: string
    }
  }>
  attendance_statistics: Array<{
    _id: string
    attendance_percentage: number
  }>
  students_by_branch: Array<{
    _id: string
    total_students: number
    branch_info: {
      name: string
      location: string
    }
  }>
  students?: Array<{
    id: string
    name: string
    email: string
    course: string
    branch: string
    status: string
    enrollment_date: string
    phone?: string
    address?: string
  }>
}

export interface CoachReportData {
  coach_statistics: Array<{
    full_name: string
    email: string
    branch_id: string
    total_courses: number
  }>
  coach_ratings: Array<{
    _id: string
    average_rating: number
    total_ratings: number
    coach_info: {
      full_name: string
      email: string
    }
  }>
  coaches_by_branch: Array<{
    _id: string
    total_coaches: number
    branch_info: {
      name: string
      location: string
    }
  }>
}

export interface BranchReportData {
  branch_statistics: Array<{
    name: string
    location: string
    state: string
    total_students: number
    total_coaches: number
    total_courses: number
  }>
  revenue_by_branch: Array<{
    _id: string
    total_revenue: number
    total_transactions: number
    branch_info: {
      name: string
      location: string
    }
  }>
}

export interface CourseReportData {
  course_enrollment_statistics: Array<{
    title: string
    code: string
    category_name: string
    total_enrollments: number
    active_enrollments: number
  }>
  course_completion_statistics: Array<{
    _id: string
    completion_rate: number
    course_info: {
      title: string
      code: string
    }
  }>
}

export interface ReportFilterOptions {
  branches: Array<{
    id: string
    name: string
  }>
  courses: Array<{
    id: string
    title: string
    code: string
  }>
  categories: Array<{
    id: string
    name: string
  }>
  payment_types: string[]
  sessions: string[]
  classes: string[]
  sections: string[]
  fees_types: string[]
}

export interface FinancialReportsResponse {
  financial_reports: FinancialReportData
  filters_applied: ReportFilters
  generated_at: string
}

export interface StudentReportsResponse {
  student_reports: StudentReportData
  generated_at: string
}

export interface CoachReportsResponse {
  coach_reports: CoachReportData
  generated_at: string
}

export interface BranchReportsResponse {
  branch_reports: BranchReportData
  generated_at: string
}

export interface CourseReportsResponse {
  course_reports: CourseReportData
  generated_at: string
}

export interface ReportFilterOptionsResponse {
  filter_options: ReportFilterOptions
}

export interface IndividualReportResponse {
  report_type: string
  data: any
  generated_at: string
}

class ReportsAPI extends BaseAPI {
  /**
   * Validate and sanitize report filters
   */
  private validateFilters(filters?: ReportFilters): ReportFilters {
    if (!filters) return {}

    const validation = validateObject(filters, reportFiltersSchema)
    if (!validation.isValid) {
      console.warn('Filter validation errors:', validation.errors)
      toast.error('Some filter values were corrected for safety')
    }

    return validation.sanitizedValue || {}
  }

  /**
   * Validate API response structure
   */
  private validateResponse<T>(response: any, expectedFields: string[] = []): T {
    const validation = validateApiResponse(response, expectedFields)
    if (!validation.isValid) {
      console.error('API response validation errors:', validation.errors)
      throw new Error('Invalid API response format')
    }

    return response as T
  }

  /**
   * Safe parameter building with validation
   */
  private buildParams(filters?: ReportFilters): URLSearchParams {
    const params = new URLSearchParams()
    const validatedFilters = this.validateFilters(filters)

    Object.entries(validatedFilters).forEach(([key, value]) => {
      if (value && isString(value) && value.trim()) {
        params.append(key, sanitizeString(value))
      }
    })

    return params
  }

  /**
   * Get report categories with validation
   */
  async getReportCategories(): Promise<any> {
    try {
      const endpoint = '/api/reports/categories'
      const response = await this.makeRequest(endpoint, {
        method: 'GET'
      })

      return this.validateResponse(response)
    } catch (error) {
      console.error('Error fetching report categories:', error)
      throw new Error('Failed to load report categories')
    }
  }

  /**
   * Get reports for a specific category with validation
   */
  async getCategoryReports(categoryId: string): Promise<any> {
    try {
      // Validate category ID
      if (!categoryId || !isString(categoryId)) {
        throw new Error('Invalid category ID')
      }

      const sanitizedCategoryId = sanitizeString(categoryId)
      if (!sanitizedCategoryId) {
        throw new Error('Category ID cannot be empty')
      }

      const endpoint = `/api/reports/categories/${encodeURIComponent(sanitizedCategoryId)}/reports`
      const response = await this.makeRequest(endpoint, {
        method: 'GET'
      })

      return this.validateResponse(response)
    } catch (error) {
      console.error('Error fetching category reports:', error)
      throw new Error(`Failed to load reports for category: ${categoryId}`)
    }
  }

  /**
   * Get individual report data with enhanced validation
   */
  async getIndividualReport(token: string, categoryId: string, reportId: string, filters?: ReportFilters): Promise<any> {
    try {
      // Validate inputs
      if (!token || !isString(token)) {
        throw new Error('Authentication token is required')
      }

      if (!categoryId || !isString(categoryId)) {
        throw new Error('Category ID is required')
      }

      if (!reportId || !isString(reportId)) {
        throw new Error('Report ID is required')
      }

      const sanitizedCategoryId = sanitizeString(categoryId)
      const sanitizedReportId = sanitizeString(reportId)

      if (!sanitizedCategoryId || !sanitizedReportId) {
        throw new Error('Invalid category or report ID')
      }

      // Build validated parameters
      const params = this.buildParams(filters)

      // Map to appropriate API endpoint based on category with validation
      const validCategories = ['student', 'course', 'coach', 'branch', 'financial', 'master']
      if (!validCategories.includes(sanitizedCategoryId)) {
        throw new Error(`Invalid category: ${sanitizedCategoryId}`)
      }

      let endpoint = ''
      const queryString = params.toString() ? `?${params.toString()}` : ''

      switch (sanitizedCategoryId) {
        case 'student':
          endpoint = `/api/reports/students${queryString}`
          break
        case 'course':
          endpoint = `/api/reports/courses${queryString}`
          break
        case 'coach':
          endpoint = `/api/reports/coaches${queryString}`
          break
        case 'branch':
          endpoint = `/api/reports/branches${queryString}`
          break
        case 'financial':
          endpoint = `/api/reports/financial${queryString}`
          break
        case 'master':
          endpoint = `/api/reports/financial${queryString}`
          break
      }

      const response = await this.makeRequest(endpoint, {
        method: 'GET',
        token: sanitizeString(token)
      })

      return this.validateResponse(response, ['generated_at'])
    } catch (error) {
      console.error('Error fetching individual report:', error)
      throw new Error(`Failed to load ${reportId} report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get comprehensive financial reports
   */
  async getFinancialReports(token: string, filters?: ReportFilters): Promise<FinancialReportsResponse> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    
    const endpoint = `/api/reports/financial${params.toString() ? `?${params.toString()}` : ''}`
    return await this.makeRequest(endpoint, {
      method: 'GET',
      token
    })
  }

  /**
   * Get comprehensive student reports
   */
  async getStudentReports(token: string, filters?: ReportFilters): Promise<StudentReportsResponse> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    
    const endpoint = `/api/reports/students${params.toString() ? `?${params.toString()}` : ''}`
    return await this.makeRequest(endpoint, {
      method: 'GET',
      token
    })
  }

  /**
   * Get comprehensive coach reports
   */
  async getCoachReports(token: string, filters?: ReportFilters): Promise<CoachReportsResponse> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    
    const endpoint = `/api/reports/coaches${params.toString() ? `?${params.toString()}` : ''}`
    return await this.makeRequest(endpoint, {
      method: 'GET',
      token
    })
  }

  /**
   * Get comprehensive branch reports
   */
  async getBranchReports(token: string, filters?: ReportFilters): Promise<BranchReportsResponse> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    
    const endpoint = `/api/reports/branches${params.toString() ? `?${params.toString()}` : ''}`
    return await this.makeRequest(endpoint, {
      method: 'GET',
      token
    })
  }

  /**
   * Get comprehensive course reports
   */
  async getCourseReports(token: string, filters?: ReportFilters): Promise<CourseReportsResponse> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    
    const endpoint = `/api/reports/courses${params.toString() ? `?${params.toString()}` : ''}`
    return await this.makeRequest(endpoint, {
      method: 'GET',
      token
    })
  }

  /**
   * Get available filter options for reports
   */
  async getReportFilters(token: string): Promise<ReportFilterOptionsResponse> {
    return await this.makeRequest('/api/reports/filters', {
      method: 'GET',
      token
    })
  }

  /**
   * Get individual financial report by type
   */
  async getIndividualFinancialReport(
    token: string, 
    reportType: string, 
    filters?: ReportFilters
  ): Promise<IndividualReportResponse> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    
    const endpoint = `/api/reports/financial/${reportType}${params.toString() ? `?${params.toString()}` : ''}`
    return await this.makeRequest(endpoint, {
      method: 'GET',
      token
    })
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * Format percentage for display
   */
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`
  }
}

export const reportsAPI = new ReportsAPI()
