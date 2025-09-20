"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, AlertCircle, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"

interface StudentAttendance {
  student_id: string
  student_name: string
  email: string
  phone?: string
  total_sessions: number
  present_sessions: number
  attendance_percentage: number
  last_attendance?: string
  branch_count: number
  course_count: number
}

interface AttendanceStats {
  total_students: number
  total_coaches: number
  average_student_attendance: number
  average_coach_attendance: number
  today_present_students: number
  today_present_coaches: number
}

export default function BranchManagerStudentAttendancePage() {
  const router = useRouter()
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("current")
  const [activeTab, setActiveTab] = useState("overview")
  const [students, setStudents] = useState<StudentAttendance[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentAttendance[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const loadStudentAttendance = async () => {
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

      console.log('🔍 Branch Manager Student Attendance - Loading data...')
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

      // Load student attendance data
      const [studentsResponse, statsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/attendance/students?${params}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/attendance/stats`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      ])

      console.log('Student attendance API response status:', studentsResponse.status)
      console.log('Attendance stats API response status:', statsResponse.status)

      if (!studentsResponse.ok) {
        const errorData = await studentsResponse.text()
        console.error('Student attendance API error:', errorData)
        throw new Error(`Failed to load student attendance: ${studentsResponse.status} - ${errorData}`)
      }

      if (!statsResponse.ok) {
        const errorData = await statsResponse.text()
        console.error('Attendance stats API error:', errorData)
        throw new Error(`Failed to load attendance stats: ${statsResponse.status} - ${errorData}`)
      }

      const studentsData = await studentsResponse.json()
      const statsData = await statsResponse.json()

      console.log('Student attendance data received:', studentsData)
      console.log('Attendance stats data received:', statsData)

      setStudents(studentsData.students || [])
      setFilteredStudents(studentsData.students || [])
      setStats(statsData)
      
      setDebugInfo({
        totalStudents: studentsData.total || 0,
        dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        apiEndpoints: ['/api/attendance/students', '/api/attendance/stats'],
        responseStatuses: [studentsResponse.status, statsResponse.status]
      })

    } catch (err) {
      console.error('Error loading student attendance:', err)
      setError(err instanceof Error ? err.message : 'Failed to load student attendance data')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterStudents(term, selectedFilter)
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    filterStudents(searchTerm, filter)
  }

  const filterStudents = (search: string, filter: string) => {
    let filtered = students

    // Apply search filter
    if (search) {
      filtered = filtered.filter(student =>
        student.student_name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply attendance filter
    if (filter === "high") {
      filtered = filtered.filter(student => student.attendance_percentage >= 90)
    } else if (filter === "medium") {
      filtered = filtered.filter(student => student.attendance_percentage >= 70 && student.attendance_percentage < 90)
    } else if (filter === "low") {
      filtered = filtered.filter(student => student.attendance_percentage < 70)
    }

    setFilteredStudents(filtered)
  }

  const handleRefresh = () => {
    loadStudentAttendance()
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

  // Chart data
  const genderData = [
    { name: "Male", value: Math.floor((stats?.total_students || 0) * 0.6), fill: "#3B82F6" },
    { name: "Female", value: Math.floor((stats?.total_students || 0) * 0.4), fill: "#A855F7" },
  ]

  const attendanceData = [
    { week: "Week 1", Present: Math.floor((stats?.today_present_students || 0) * 1.2), Absent: Math.floor((stats?.total_students || 0) * 0.1) },
    { week: "Week 2", Present: Math.floor((stats?.today_present_students || 0) * 1.1), Absent: Math.floor((stats?.total_students || 0) * 0.15) },
    { week: "Week 3", Present: Math.floor((stats?.today_present_students || 0) * 1.0), Absent: Math.floor((stats?.total_students || 0) * 0.12) },
    { week: "Week 4", Present: Math.floor((stats?.today_present_students || 0) * 0.9), Absent: Math.floor((stats?.total_students || 0) * 0.18) },
  ]

  useEffect(() => {
    loadStudentAttendance()
  }, [selectedMonth])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading student attendance data...</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Student Attendance</h3>
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
            <h1 className="text-2xl font-bold text-gray-900">Student Attendance</h1>
            <p className="text-gray-600">Track and analyze student attendance patterns</p>
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
                  <span className="font-medium text-blue-800">Total Students:</span>
                  <span className="ml-2 text-blue-700">{debugInfo.totalStudents}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Date Range:</span>
                  <span className="ml-2 text-blue-700">{debugInfo.dateRange}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">API Endpoints:</span>
                  <span className="ml-2 text-blue-700">{debugInfo.apiEndpoints.join(', ')}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Status:</span>
                  <span className="ml-2 text-blue-700">{debugInfo.responseStatuses.join(', ')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="students">Student List</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600">{stats?.total_students || 0}</div>
                  <p className="text-sm text-gray-600">Total Students</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-600">{stats?.today_present_students || 0}</div>
                  <p className="text-sm text-gray-600">Present Today</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-purple-600">{stats?.average_student_attendance.toFixed(1) || 0}%</div>
                  <p className="text-sm text-gray-600">Average Attendance</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-orange-600">{stats?.total_coaches || 0}</div>
                  <p className="text-sm text-gray-600">Total Coaches</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attendance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Attendance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Present" fill="#3B82F6" name="Present" />
                      <Bar dataKey="Absent" fill="#EF4444" name="Absent" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gender Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart data={genderData}>
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                      <Tooltip />
                      <Legend />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students by name or email..."
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
                  <SelectItem value="all">All Students</SelectItem>
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

            {/* Student List */}
            {filteredStudents.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Student Attendance Data</h3>
                  <p className="text-gray-600">
                    {students.length === 0 
                      ? "No student attendance records found for the selected period."
                      : "No students match your current search and filter criteria."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredStudents.map((student) => (
                  <Card key={student.student_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src="" alt={student.student_name} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {student.student_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-gray-900">{student.student_name}</h3>
                            <p className="text-sm text-gray-600">{student.email}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {student.course_count} course{student.course_count !== 1 ? 's' : ''}
                              </span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500">
                                {student.branch_count} branch{student.branch_count !== 1 ? 'es' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {student.present_sessions}/{student.total_sessions} sessions
                          </div>
                          <Badge variant={getAttendanceBadgeVariant(student.attendance_percentage)}>
                            {student.attendance_percentage.toFixed(1)}% - {getAttendanceStatus(student.attendance_percentage)}
                          </Badge>
                          {student.last_attendance && (
                            <div className="text-xs text-gray-500 mt-1">
                              Last: {new Date(student.last_attendance).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
