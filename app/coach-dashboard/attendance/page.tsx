"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Calendar as CalendarIcon,
  Users, 
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Download,
  Filter,
  Loader2,
  Eye
} from "lucide-react"
import { format } from "date-fns"
import CoachDashboardHeader from "@/components/coach-dashboard-header"
import { checkCoachAuth, getCoachAuthHeaders } from "@/lib/coachAuth"
import { cn } from "@/lib/utils"

interface AttendanceRecord {
  id: string
  student_name: string
  student_id: string
  course_name: string
  course_id: string
  date: string
  status: "present" | "absent" | "late"
  check_in_time?: string
  check_out_time?: string
  notes?: string
}

interface AttendanceStats {
  total_students: number
  present_today: number
  absent_today: number
  late_today: number
  attendance_rate: number
}

export default function CoachAttendancePage() {
  const router = useRouter()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([])
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coachData, setCoachData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("today")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  useEffect(() => {
    // Use the robust coach authentication check
    const authResult = checkCoachAuth()

    if (!authResult.isAuthenticated) {
      console.log("Coach not authenticated:", authResult.error)
      router.push("/coach/login")
      return
    }

    if (authResult.coach && authResult.token) {
      setCoachData(authResult.coach)
      fetchAttendanceData(authResult.token, authResult.coach.id)
    } else {
      setError("Coach information not found")
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    // Filter records based on search term
    if (searchTerm) {
      const filtered = attendanceRecords.filter(record =>
        record.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.course_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredRecords(filtered)
    } else {
      setFilteredRecords(attendanceRecords)
    }
  }, [searchTerm, attendanceRecords])

  const fetchAttendanceData = async (token: string, coachId: string) => {
    try {
      setLoading(true)
      setError(null)

      // For now, we'll use mock data since the specific coach attendance endpoint may not be implemented
      // In a real implementation, this would call: `/api/coaches/${coachId}/attendance`
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock data for demonstration
      const mockRecords: AttendanceRecord[] = [
        {
          id: "1",
          student_name: "John Smith",
          student_id: "STU001",
          course_name: "Karate Basics",
          course_id: "COURSE001",
          date: new Date().toISOString().split('T')[0],
          status: "present",
          check_in_time: "09:00 AM",
          check_out_time: "10:30 AM",
          notes: "Good participation"
        },
        {
          id: "2",
          student_name: "Sarah Johnson",
          student_id: "STU002",
          course_name: "Advanced Taekwondo",
          course_id: "COURSE002",
          date: new Date().toISOString().split('T')[0],
          status: "late",
          check_in_time: "09:15 AM",
          check_out_time: "10:30 AM",
          notes: "Arrived 15 minutes late"
        },
        {
          id: "3",
          student_name: "Mike Chen",
          student_id: "STU003",
          course_name: "Kung Fu Fundamentals",
          course_id: "COURSE003",
          date: new Date().toISOString().split('T')[0],
          status: "absent",
          notes: "Informed about absence"
        },
        {
          id: "4",
          student_name: "Emily Davis",
          student_id: "STU004",
          course_name: "Karate Basics",
          course_id: "COURSE001",
          date: new Date().toISOString().split('T')[0],
          status: "present",
          check_in_time: "08:55 AM",
          check_out_time: "10:25 AM"
        }
      ]

      const mockStats: AttendanceStats = {
        total_students: 45,
        present_today: 38,
        absent_today: 5,
        late_today: 2,
        attendance_rate: 84.4
      }

      setAttendanceRecords(mockRecords)
      setFilteredRecords(mockRecords)
      setAttendanceStats(mockStats)
    } catch (error) {
      console.error("Error fetching attendance data:", error)
      setError("Failed to load attendance data")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAttendance = (recordId: string, status: "present" | "absent" | "late") => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.id === recordId 
          ? { ...record, status, check_in_time: status !== "absent" ? "09:00 AM" : undefined }
          : record
      )
    )
  }

  const handleExportAttendance = () => {
    // Implement export functionality
    console.log("Exporting attendance data...")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800">Present</Badge>
      case "absent":
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Attendance"
          coachName={coachData?.full_name || "Coach"}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !attendanceStats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Attendance"
          coachName={coachData?.full_name || "Coach"}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-red-600">
                  <p className="font-medium">Error loading attendance data</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachDashboardHeader 
        currentPage="Attendance"
        coachName={coachData?.full_name || "Coach"}
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attendance Tracking</h1>
              <p className="text-gray-600">Monitor and manage student attendance</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleExportAttendance} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date || new Date())
                      setDatePickerOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{attendanceStats.total_students}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Present Today</p>
                    <p className="text-2xl font-bold text-gray-900">{attendanceStats.present_today}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Absent Today</p>
                    <p className="text-2xl font-bold text-gray-900">{attendanceStats.absent_today}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Late Today</p>
                    <p className="text-2xl font-bold text-gray-900">{attendanceStats.late_today}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">%</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{attendanceStats.attendance_rate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students or courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          {/* Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? "No records match your search." : "No attendance records found for today."}
                    </p>
                  </div>
                ) : (
                  filteredRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-medium text-gray-900">{record.student_name}</h3>
                            <p className="text-sm text-gray-600">{record.course_name}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {record.check_in_time && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Check In</p>
                            <p className="text-sm font-medium">{record.check_in_time}</p>
                          </div>
                        )}
                        
                        {record.check_out_time && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Check Out</p>
                            <p className="text-sm font-medium">{record.check_out_time}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(record.status)}
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant={record.status === "present" ? "default" : "outline"}
                            onClick={() => handleMarkAttendance(record.id, "present")}
                            className="text-xs"
                          >
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant={record.status === "late" ? "default" : "outline"}
                            onClick={() => handleMarkAttendance(record.id, "late")}
                            className="text-xs"
                          >
                            Late
                          </Button>
                          <Button
                            size="sm"
                            variant={record.status === "absent" ? "default" : "outline"}
                            onClick={() => handleMarkAttendance(record.id, "absent")}
                            className="text-xs"
                          >
                            Absent
                          </Button>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/coach-dashboard/students/${record.student_id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
