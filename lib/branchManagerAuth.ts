// Branch Manager Authentication utility
export interface BranchManagerUser {
  id: string
  full_name: string
  email: string
  phone: string
  role: 'branch_manager'
  branch_id: string
  branch_name: string
}

export interface BranchManagerLoginResponse {
  status: string
  message: string
  data: {
    id: string
    full_name: string
    email: string
    phone: string
    token: string
    token_type: string
    expires_in: number
    branch_id: string
    branch_name: string
  }
}

export interface BranchManagerAuthResult {
  isAuthenticated: boolean
  user: BranchManagerUser | null
  token: string | null
  tokenExpiration: number | null
}

/**
 * Check if branch manager is authenticated
 */
export function checkBranchManagerAuth(): BranchManagerAuthResult {
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      user: null,
      token: null,
      tokenExpiration: null
    }
  }

  try {
    const token = localStorage.getItem('access_token')
    const branchManagerData = localStorage.getItem('branch_manager')
    const tokenExpiration = localStorage.getItem('token_expiration')

    if (!token || !branchManagerData || !tokenExpiration) {
      return {
        isAuthenticated: false,
        user: null,
        token: null,
        tokenExpiration: null
      }
    }

    const expirationTime = parseInt(tokenExpiration)
    const isExpired = Date.now() >= expirationTime

    if (isExpired) {
      clearBranchManagerSession()
      return {
        isAuthenticated: false,
        user: null,
        token: null,
        tokenExpiration: null
      }
    }

    const user: BranchManagerUser = JSON.parse(branchManagerData)
    
    // Verify this is actually a branch manager
    if (user.role !== 'branch_manager') {
      return {
        isAuthenticated: false,
        user: null,
        token: null,
        tokenExpiration: null
      }
    }

    return {
      isAuthenticated: true,
      user,
      token,
      tokenExpiration: expirationTime
    }
  } catch (error) {
    console.error('Error checking branch manager authentication:', error)
    clearBranchManagerSession()
    return {
      isAuthenticated: false,
      user: null,
      token: null,
      tokenExpiration: null
    }
  }
}

/**
 * Store branch manager authentication data
 */
export function storeBranchManagerAuth(authData: {
  access_token: string
  token_type: string
  expires_in: number
  branch_manager: BranchManagerUser
}): void {
  if (typeof window === 'undefined') return

  const expirationTime = Date.now() + (authData.expires_in * 1000)

  localStorage.setItem('access_token', authData.access_token)
  localStorage.setItem('token', authData.access_token) // Backward compatibility
  localStorage.setItem('token_type', authData.token_type)
  localStorage.setItem('expires_in', authData.expires_in.toString())
  localStorage.setItem('token_expiration', expirationTime.toString())
  localStorage.setItem('branch_manager', JSON.stringify(authData.branch_manager))
  localStorage.setItem('user', JSON.stringify(authData.branch_manager)) // For compatibility

  console.log('🔐 Branch Manager authentication data stored successfully')
}

/**
 * Clear branch manager session
 */
export function clearBranchManagerSession(): void {
  if (typeof window === 'undefined') return

  const keysToRemove = [
    'access_token',
    'token',
    'token_type',
    'expires_in',
    'token_expiration',
    'branch_manager',
    'user'
  ]

  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
  })

  console.log('🔓 Branch Manager session cleared')
}

/**
 * Check if branch manager token is valid
 */
export function isBranchManagerTokenValid(): boolean {
  const authResult = checkBranchManagerAuth()
  return authResult.isAuthenticated
}

/**
 * Get branch manager authentication headers for API requests
 */
export function getBranchManagerAuthHeaders(): Record<string, string> {
  const authResult = checkBranchManagerAuth()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (authResult.isAuthenticated && authResult.token) {
    headers['Authorization'] = `Bearer ${authResult.token}`
  }

  return headers
}

/**
 * Get current branch manager user
 */
export function getCurrentBranchManager(): BranchManagerUser | null {
  const authResult = checkBranchManagerAuth()
  return authResult.user
}

/**
 * Check if current user is a branch manager
 */
export function isBranchManager(): boolean {
  const authResult = checkBranchManagerAuth()
  return authResult.isAuthenticated && authResult.user?.role === 'branch_manager'
}

/**
 * Redirect to branch manager login if not authenticated
 */
export function requireBranchManagerAuth(redirectPath: string = '/branch-manager/login'): boolean {
  if (typeof window === 'undefined') return false

  const authResult = checkBranchManagerAuth()
  
  if (!authResult.isAuthenticated) {
    window.location.href = redirectPath
    return false
  }
  
  return true
}

/**
 * Hook-like function for branch manager authentication in React components
 */
export function useBranchManagerAuth() {
  const authResult = checkBranchManagerAuth()
  
  return {
    ...authResult,
    clearSession: clearBranchManagerSession,
    getAuthHeaders: getBranchManagerAuthHeaders,
    requireAuth: requireBranchManagerAuth,
    isBranchManager: isBranchManager
  }
}

/**
 * Branch Manager Auth object for compatibility with existing patterns
 */
export const BranchManagerAuth = {
  isAuthenticated: (): boolean => {
    return checkBranchManagerAuth().isAuthenticated
  },

  getUser: (): BranchManagerUser | null => {
    return getCurrentBranchManager()
  },

  getToken: (): string | null => {
    return checkBranchManagerAuth().token
  },

  isTokenValid: (): boolean => {
    return isBranchManagerTokenValid()
  },

  getAuthHeaders: (): Record<string, string> => {
    return getBranchManagerAuthHeaders()
  },

  logout: (): void => {
    clearBranchManagerSession()
  },

  requireAuth: (redirectPath?: string): boolean => {
    return requireBranchManagerAuth(redirectPath)
  }
}

export default BranchManagerAuth
