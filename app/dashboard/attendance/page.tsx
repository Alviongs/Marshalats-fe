"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts"
import { 
  Calendar, 
  CalendarIcon, 
  Download, 
  Search, 
  Filter, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  FileText,
  TrendingUp,
  MapPin,
  BookOpen,
  User,
  Award,
  ArrowRight,
  Eye,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DashboardHeader from "@/components/dashboard-header"
import { SuperAdminAuth } from "@/lib/auth"

interface AttendanceOverviewStats {
  total_students: number
  total_coaches: number
  student_present_today: number
  student_absent_today: number
  student_late_today: number
  coach_present_today: number
  coach_absent_today: number
  coach_late_today: number
  overall_attendance_rate: number
  student_attendance_rate: number
  coach_attendance_rate: number
}

interface BranchStats {
  id: string
  name: string
  total_students: number
  total_coaches: number
  student_present: number
  coach_present: number
  attendance_rate: number
}

export default function AttendanceOverviewPage() {
  const router = useRouter()
  
  // State management
  const [stats, setStats] = useState<AttendanceOverviewStats>({
    total_students: 0,
    total_coaches: 0,
    student_present_today: 0,
    student_absent_today: 0,
    student_late_today: 0,
    coach_present_today: 0,
    coach_absent_today: 0,
    coach_late_today: 0,
    overall_attendance_rate: 0,
    student_attendance_rate: 0,
    coach_attendance_rate: 0
  })
  const [branchStats, setBranchStats] = useState<BranchStats[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Clear error after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Fetch attendance overview data
  const fetchAttendanceOverview = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!SuperAdminAuth.isAuthenticated()) {
        setError("Authentication required")
        return
      }

      const headers = SuperAdminAuth.getAuthHeaders()
      const dateStr = format(selectedDate, 'yyyy-MM-dd')

      console.log(`🔄 Fetching attendance overview for date: ${dateStr}`)

      // Fetch students data
      const studentsResponse = await fetch(`http://31.97.224.169:8003/api/attendance/students?date=${dateStr}`, {
        method: 'GET',
        headers
      })

      // Fetch coaches data
      const coachesResponse = await fetch('http://31.97.224.169:8003/api/coaches', {
        method: 'GET',
        headers
      })

      // Fetch branches data
      const branchesResponse = await fetch('http://31.97.224.169:8003/api/branches', {
        method: 'GET',
        headers
      })

      let studentData = []
      let coachData = []
      let branchData = []

      if (studentsResponse.ok) {
        const data = await studentsResponse.json()
        studentData = data.students || []
      }

      if (coachesResponse.ok) {
        const data = await coachesResponse.json()
        coachData = data.coaches || []
      }

      if (branchesResponse.ok) {
        const data = await branchesResponse.json()
        branchData = data.branches || []
      }

      // Calculate statistics
      const studentStats = {
        total: studentData.length,
        present: studentData.filter((s: any) => s.attendance?.status === "present").length,
        absent: studentData.filter((s: any) => s.attendance?.status === "absent").length,
        late: studentData.filter((s: any) => s.attendance?.status === "late").length
      }

      const coachStats = {
        total: coachData.length,
        present: 0, // We'll assume coaches are not marked yet
        absent: 0,
        late: 0
      }

      const overviewStats: AttendanceOverviewStats = {
        total_students: studentStats.total,
        total_coaches: coachStats.total,
        student_present_today: studentStats.present,
        student_absent_today: studentStats.absent,
        student_late_today: studentStats.late,
        coach_present_today: coachStats.present,
        coach_absent_today: coachStats.absent,
        coach_late_today: coachStats.late,
        overall_attendance_rate: studentStats.total > 0 ? 
          ((studentStats.present + studentStats.late) / studentStats.total) * 100 : 0,
        student_attendance_rate: studentStats.total > 0 ? 
          ((studentStats.present + studentStats.late) / studentStats.total) * 100 : 0,
        coach_attendance_rate: coachStats.total > 0 ? 
          ((coachStats.present + coachStats.late) / coachStats.total) * 100 : 0
      }

      setStats(overviewStats)

      // Calculate branch-wise statistics
      const branchStatsData: BranchStats[] = branchData.map((branch: any) => {
        const branchStudents = studentData.filter((s: any) => s.branch_id === branch.id)
        const branchCoaches = coachData.filter((c: any) => c.branch_id === branch.id)
        const presentStudents = branchStudents.filter((s: any) => s.attendance?.status === "present").length
        
        return {
          id: branch.id,
          name: branch.branch?.name || branch.name || 'Unknown Branch',
          total_students: branchStudents.length,
          total_coaches: branchCoaches.length,
          student_present: presentStudents,
          coach_present: 0, // Placeholder
          attendance_rate: branchStudents.length > 0 ? (presentStudents / branchStudents.length) * 100 : 0
        }
      }).filter(branch => branch.total_students > 0 || branch.total_coaches > 0)

      setBranchStats(branchStatsData)
      console.log("✅ Attendance overview data loaded successfully")

    } catch (error) {
      console.error("❌ Error fetching attendance overview:", error)
      setError("Failed to load attendance overview. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount and date change
  useEffect(() => {
    fetchAttendanceOverview()
  }, [selectedDate])

  // Chart data
  const getAttendanceChartData = () => [
    { name: 'Students Present', value: stats.student_present_today, fill: '#10B981' },
    { name: 'Students Absent', value: stats.student_absent_today, fill: '#EF4444' },
    { name: 'Students Late', value: stats.student_late_today, fill: '#F59E0B' },
    { name: 'Coaches Present', value: stats.coach_present_today, fill: '#3B82F6' },
    { name: 'Coaches Absent', value: stats.coach_absent_today, fill: '#DC2626' },
    { name: 'Coaches Late', value: stats.coach_late_today, fill: '#D97706' }
  ]

  const getTrendData = () => {
    // Mock trend data - in real app, this would come from API
    return [
      { date: '2025-01-01', students: 85, coaches: 95 },
      { date: '2025-01-02', students: 88, coaches: 92 },
      { date: '2025-01-03', students: 82, coaches: 98 },
      { date: '2025-01-04', students: 90, coaches: 94 },
      { date: '2025-01-05', students: 87, coaches: 96 },
      { date: '2025-01-06', students: 91, coaches: 93 },
      { date: '2025-01-07', students: 89, coaches: 97 }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Overview</h1>
          <p className="text-gray-600">Comprehensive attendance management across all branches</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Date Selector and Actions */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Select Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={fetchAttendanceOverview}
                  variant="outline"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/attendance/students')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Students
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/attendance/coaches')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Manage Coaches
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_students}</p>
                  <p className="text-xs text-green-600">
                    {stats.student_present_today} present today
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Coaches</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_coaches}</p>
                  <p className="text-xs text-green-600">
                    {stats.coach_present_today} present today
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Student Attendance</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.student_attendance_rate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.student_present_today + stats.student_late_today} of {stats.total_students}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Coach Attendance</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.coach_attendance_rate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.coach_present_today + stats.coach_late_today} of {stats.total_coaches}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push('/dashboard/attendance/students')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Attendance</h3>
                  <p className="text-gray-600 mb-4">Manage attendance for all students across branches</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">{stats.student_present_today} Present</span>
                    </div>
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-600 mr-1" />
                      <span className="text-sm text-red-600">{stats.student_absent_today} Absent</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-yellow-600 mr-1" />
                      <span className="text-sm text-yellow-600">{stats.student_late_today} Late</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push('/dashboard/attendance/coaches')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Coach Attendance</h3>
                  <p className="text-gray-600 mb-4">Manage attendance for all coaches across branches</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">{stats.coach_present_today} Present</span>
                    </div>
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-600 mr-1" />
                      <span className="text-sm text-red-600">{stats.coach_absent_today} Absent</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-yellow-600 mr-1" />
                      <span className="text-sm text-yellow-600">{stats.coach_late_today} Late</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Attendance Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2" />
                Today's Attendance Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getAttendanceChartData().filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getAttendanceChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                7-Day Attendance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Student Attendance %"
                    />
                    <Line
                      type="monotone"
                      dataKey="coaches"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Coach Attendance %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Branch-wise Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Branch-wise Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading branch statistics...</span>
              </div>
            ) : branchStats.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No branch data available</h3>
                <p className="text-gray-500">Branch statistics will appear here once data is loaded.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Students
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Students Present
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Coaches
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coaches Present
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendance Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {branchStats.map((branch) => (
                      <tr key={branch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{branch.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {branch.total_students}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {branch.student_present}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {branch.total_coaches}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {branch.coach_present}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${branch.attendance_rate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {branch.attendance_rate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/dashboard/attendance/students?branch=${branch.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
