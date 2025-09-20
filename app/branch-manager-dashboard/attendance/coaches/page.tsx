"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MessageCircle, Phone, AlertCircle, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"

interface CoachAttendance {
  coach_id: string
  coach_name: string
  email: string
  phone?: string
  branch_id: string
  expertise: string[]
  total_days: number
  present_days: number
  attendance_percentage: number
  last_attendance?: string
}

export default function BranchManagerCoachAttendancePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("master")
  const [coaches, setCoaches] = useState<CoachAttendance[]>([])
  const [filteredCoaches, setFilteredCoaches] = useState<CoachAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("current")
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const loadCoachAttendance = async () => {
    try {
      setLoading(true)
      setError(null)

      const currentUser = BranchManagerAuth.getCurrentUser()
      const token = BranchManagerAuth.getToken()

      if (!currentUser || !token) {
        setError("Authentication required. Please log in.")
        router.push('/branch-manager/login')
        return
      }

      console.log('🔍 Branch Manager Coach Attendance - Loading data...')
      console.log('Current user:', currentUser.full_name)
      console.log('Token available:', !!token)

      // Calculate date range based on selected month
      const now = new Date()
      let startDate, endDate
      
      if (selectedMonth === "current") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      } else {
        // Previous month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
      }

      const params = new URLSearchParams({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/attendance/coaches?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Coach attendance API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Coach attendance API error:', errorData)
        throw new Error(`Failed to load coach attendance: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      console.log('Coach attendance data received:', data)

      setCoaches(data.coaches || [])
      setFilteredCoaches(data.coaches || [])
      
      setDebugInfo({
        totalCoaches: data.total || 0,
        dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        apiEndpoint: '/api/attendance/coaches',
        responseStatus: response.status
      })

    } catch (err) {
      console.error('Error loading coach attendance:', err)
      setError(err instanceof Error ? err.message : 'Failed to load coach attendance data')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterCoaches(term, selectedFilter)
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    filterCoaches(searchTerm, filter)
  }

  const filterCoaches = (search: string, filter: string) => {
    let filtered = coaches

    // Apply search filter
    if (search) {
      filtered = filtered.filter(coach =>
        coach.coach_name.toLowerCase().includes(search.toLowerCase()) ||
        coach.email.toLowerCase().includes(search.toLowerCase()) ||
        coach.expertise.some(exp => exp.toLowerCase().includes(search.toLowerCase()))
      )
    }

    // Apply attendance filter
    if (filter === "high") {
      filtered = filtered.filter(coach => coach.attendance_percentage >= 90)
    } else if (filter === "medium") {
      filtered = filtered.filter(coach => coach.attendance_percentage >= 70 && coach.attendance_percentage < 90)
    } else if (filter === "low") {
      filtered = filtered.filter(coach => coach.attendance_percentage < 70)
    }

    setFilteredCoaches(filtered)
  }

  const handleRefresh = () => {
    loadCoachAttendance()
  }

  const getAttendanceBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return "default" // Green
    if (percentage >= 70) return "secondary" // Yellow
    return "destructive" // Red
  }

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return "Excellent"
    if (percentage >= 70) return "Good"
    return "Needs Improvement"
  }

  useEffect(() => {
    loadCoachAttendance()
  }, [selectedMonth])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading coach attendance data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Coach Attendance</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Coach Attendance</h1>
            <p className="text-gray-600">Track and monitor coach attendance records</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📊 Debug Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Total Coaches:</span>
                  <span className="ml-2 text-blue-700">{debugInfo.totalCoaches}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Date Range:</span>
                  <span className="ml-2 text-blue-700">{debugInfo.dateRange}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">API Endpoint:</span>
                  <span className="ml-2 text-blue-700">{debugInfo.apiEndpoint}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Status:</span>
                  <span className="ml-2 text-blue-700">{debugInfo.responseStatus}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search coaches by name, email, or expertise..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by attendance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Coaches</SelectItem>
              <SelectItem value="high">High Attendance (90%+)</SelectItem>
              <SelectItem value="medium">Medium Attendance (70-89%)</SelectItem>
              <SelectItem value="low">Low Attendance (&lt;70%)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="previous">Previous Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Coach Attendance Cards */}
        {filteredCoaches.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Coach Attendance Data</h3>
              <p className="text-gray-600">
                {coaches.length === 0 
                  ? "No coach attendance records found for the selected period."
                  : "No coaches match your current search and filter criteria."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredCoaches.map((coach) => (
              <Card key={coach.coach_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" alt={coach.coach_name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {coach.coach_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{coach.coach_name}</h3>
                        <p className="text-sm text-gray-600">{coach.email}</p>
                        {coach.expertise.length > 0 && (
                          <p className="text-sm text-gray-500">
                            Expertise: {coach.expertise.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {coach.present_days}/{coach.total_days} days
                        </div>
                        <Badge variant={getAttendanceBadgeVariant(coach.attendance_percentage)}>
                          {coach.attendance_percentage.toFixed(1)}% - {getAttendanceStatus(coach.attendance_percentage)}
                        </Badge>
                        {coach.last_attendance && (
                          <div className="text-xs text-gray-500 mt-1">
                            Last: {new Date(coach.last_attendance).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => window.open(`mailto:${coach.email}`)}>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          {coach.phone && (
                            <DropdownMenuItem onClick={() => window.open(`tel:${coach.phone}`)}>
                              <Phone className="h-4 w-4 mr-2" />
                              Call Coach
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
