"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [coachData, setCoachData] = useState<any>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{[key: string]: 'saving' | 'success' | 'error'}>({})
  const [bulkSaving, setBulkSaving] = useState(false)
  const [viewMode, setViewMode] = useState<'today' | 'historical'>('today')
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // 7 days ago
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [historicalRecords, setHistoricalRecords] = useState<AttendanceRecord[]>([])
  const [loadingHistorical, setLoadingHistorical] = useState(false)

  // TEMPORARY: Skip auth for testing button functionality
  // Set to false to restore normal authentication
  const skipAuth = false





  useEffect(() => {
    if (skipAuth) {
      console.log("🧪 TESTING MODE: Skipping authentication")
      const mockCoach = {
        id: "test-coach-id",
        full_name: "Test Coach",
        email: "test@example.com",
        branch_id: "test-branch-id"
      }
      setCoachData(mockCoach)
      // Create some mock attendance data
      const mockRecords = [
        {
          id: "1",
          student_id: "student1",
          student_name: "John Doe",
          course_id: "course1",
          course_name: "Karate Basics",
          status: "absent" as const,
          date: new Date().toISOString().split('T')[0],
          attendance_date: new Date().toISOString().split('T')[0]
        },
        {
          id: "2",
          student_id: "student2",
          student_name: "Jane Smith",
          course_id: "course1",
          course_name: "Karate Basics",
          status: "present" as const,
          date: new Date().toISOString().split('T')[0],
          attendance_date: new Date().toISOString().split('T')[0]
        },
        {
          id: "3",
          student_id: "student3",
          student_name: "Mike Johnson",
          course_id: "course1",
          course_name: "Karate Basics",
          status: "late" as const,
          date: new Date().toISOString().split('T')[0],
          attendance_date: new Date().toISOString().split('T')[0]
        }
      ]

      // Set mock statistics
      const mockStats: AttendanceStats = {
        total_students: mockRecords.length,
        present_today: mockRecords.filter(r => r.status === "present").length,
        absent_today: mockRecords.filter(r => r.status === "absent").length,
        late_today: mockRecords.filter(r => r.status === "late").length,
        attendance_rate: mockRecords.length > 0 ?
          (mockRecords.filter(r => r.status === "present" || r.status === "late").length / mockRecords.length) * 100 : 0
      }

      setAttendanceRecords(mockRecords)
      setFilteredRecords(mockRecords)
      setAttendanceStats(mockStats)
      setLoading(false)
      console.log("🧪 TESTING MODE: Mock data loaded successfully", mockRecords.length, "students")
      return
    }

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

  // Effect to reload data when selected date changes
  useEffect(() => {
    if (!skipAuth && coachData) {
      const authResult = checkCoachAuth()
      if (authResult.isAuthenticated && authResult.token && authResult.coach) {
        fetchAttendanceData(authResult.token, authResult.coach.id)
      }
    }
  }, [selectedDate, coachData])

  const fetchHistoricalAttendance = async () => {
    try {
      setLoadingHistorical(true)
      setError(null)

      const authResult = checkCoachAuth()
      if (!authResult.isAuthenticated || !authResult.coach) {
        throw new Error("Coach authentication required")
      }

      const branchId = authResult.coach?.branch_id
      if (!branchId) {
        setError("Coach is not assigned to any branch")
        return
      }

      console.log("📊 Fetching historical attendance records...")

      // Format dates for API
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      // Fetch historical attendance reports
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/attendance/reports?branch_id=${branchId}&start_date=${startDateStr}&end_date=${endDateStr}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authResult.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch historical attendance: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Historical attendance data received:", data)

      // Transform the data into AttendanceRecord format
      const records: AttendanceRecord[] = data.reports?.map((record: any) => ({
        id: record.id || `${record.student_id}_${record.attendance_date}`,
        student_name: record.student_name || 'Unknown Student',
        student_id: record.student_id,
        course_name: record.course_name || 'Unknown Course',
        course_id: record.course_id,
        date: record.attendance_date ? new Date(record.attendance_date).toISOString().split('T')[0] : '',
        status: record.status || (record.is_present ? "present" : "absent"),
        check_in_time: record.check_in_time ?
          new Date(record.check_in_time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }) : "",
        check_out_time: record.check_out_time ?
          new Date(record.check_out_time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }) : "",
        notes: record.notes || ""
      })) || []

      setHistoricalRecords(records)
      console.log(`📊 Loaded ${records.length} historical attendance records`)

    } catch (error) {
      console.error("Error fetching historical attendance:", error)
      setError(`Failed to load historical attendance: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setHistoricalRecords([])
    } finally {
      setLoadingHistorical(false)
    }
  }

  const fetchAttendanceData = async (token: string, coachId: string) => {
    try {
      setLoading(true)
      setError(null)

      const authResult = checkCoachAuth()
      if (!authResult.isAuthenticated || !authResult.coach) {
        throw new Error("Coach authentication required")
      }

      // Get the coach's branch ID for filtering (same as students page)
      const branchId = authResult.coach?.branch_id
      if (!branchId) {
        console.error("❌ No branch ID found for coach")
        setError("Coach is not assigned to any branch")
        setLoading(false)
        return
      }

      console.log("🏢 Fetching students by branch:", branchId)

      // Use selected date instead of always using today
      const selectedDateStr = selectedDate.toISOString().split('T')[0]

      // Fetch attendance data directly from the attendance endpoint (includes students + attendance)
      const attendanceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/attendance/coach/${coachId}/students/attendance?date=${selectedDateStr}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!attendanceResponse.ok) {
        throw new Error(`Failed to fetch attendance data: ${attendanceResponse.status} ${attendanceResponse.statusText}`)
      }

      const attendanceData = await attendanceResponse.json()
      console.log("✅ ATTENDANCE PAGE: Attendance data received:", attendanceData)
      console.log("✅ ATTENDANCE PAGE: Number of students:", attendanceData.students?.length || 0)

      // Transform attendance data into attendance records
      const attendanceRecords: AttendanceRecord[] = []
      const students = attendanceData.students || []

      for (const student of students) {
        // Get course information
        const primaryCourse = student.courses?.[0]
        const attendance = student.attendance || {}

        attendanceRecords.push({
          id: `${student.id}_${selectedDateStr}`,
          student_name: student.full_name || 'Unknown Student',
          student_id: student.id,
          course_name: primaryCourse?.name || primaryCourse?.course_name || 'No Course Assigned',
          course_id: primaryCourse?.id || primaryCourse?.course_id || '',
          date: selectedDateStr,
          status: attendance.status || "absent", // Use actual attendance status or default to absent
          check_in_time: attendance.check_in_time ?
            new Date(attendance.check_in_time).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }) : "",
          check_out_time: attendance.check_out_time ?
            new Date(attendance.check_out_time).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }) : "",
          notes: attendance.notes || ""
        })
      }

      // Calculate statistics
      const stats: AttendanceStats = {
        total_students: attendanceRecords.length,
        present_today: attendanceRecords.filter(r => r.status === "present").length,
        absent_today: attendanceRecords.filter(r => r.status === "absent").length,
        late_today: attendanceRecords.filter(r => r.status === "late").length,
        attendance_rate: attendanceRecords.length > 0 ?
          (attendanceRecords.filter(r => r.status === "present" || r.status === "late").length / attendanceRecords.length) * 100 : 0
      }

      setAttendanceRecords(attendanceRecords)
      setFilteredRecords(attendanceRecords)
      setAttendanceStats(stats)

      if (attendanceRecords.length === 0) {
        // Check if we have debug info from the API
        const debugInfo = attendanceData.debug_info
        if (debugInfo) {
          console.log("🔍 Debug info from API:", debugInfo)
          setError(`No students found. Debug info: ${JSON.stringify(debugInfo)}. Please contact administrator to assign students to your courses.`)
        } else {
          setError("No students found. Please ensure you have students assigned to your courses or contact the administrator.")
        }
      }

    } catch (error) {
      console.error("Error fetching attendance data:", error)

      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('401')) {
        setError("Authentication failed. Please log in again as a coach.")
      } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
        setError("Backend server is not available. Using demo data for testing.")

        // Provide demo data when backend is not available
        const demoRecords: AttendanceRecord[] = [
          {
            id: "demo_1",
            student_name: "John Smith",
            student_id: "STU001",
            course_name: "Karate Basics",
            course_id: "COURSE001",
            date: new Date().toISOString().split('T')[0],
            status: "present",
            check_in_time: "09:00 AM",
            check_out_time: "10:30 AM",
            notes: "Demo data - Backend not available"
          },
          {
            id: "demo_2",
            student_name: "Sarah Johnson",
            student_id: "STU002",
            course_name: "Advanced Taekwondo",
            course_id: "COURSE002",
            date: new Date().toISOString().split('T')[0],
            status: "late",
            check_in_time: "09:15 AM",
            check_out_time: "10:30 AM",
            notes: "Demo data - Backend not available"
          }
        ]

        const demoStats: AttendanceStats = {
          total_students: 2,
          present_today: 1,
          absent_today: 0,
          late_today: 1,
          attendance_rate: 100
        }

        setAttendanceRecords(demoRecords)
        setFilteredRecords(demoRecords)
        setAttendanceStats(demoStats)
      } else {
        setError(`Failed to load attendance data: ${error instanceof Error ? error.message : 'Unknown error'}`)

        // Fallback to empty state for other errors
        setAttendanceRecords([])
        setFilteredRecords([])
        setAttendanceStats({
          total_students: 0,
          present_today: 0,
          absent_today: 0,
          late_today: 0,
          attendance_rate: 0
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAttendance = async (recordId: string, status: "present" | "absent" | "late") => {
    try {
      // Set saving status for this record
      setSaveStatus(prev => ({ ...prev, [recordId]: 'saving' }))

      // Add debugging
      console.log("🔄 Marking attendance for record:", recordId, "status:", status)

      const authResult = checkCoachAuth()
      if (!authResult.isAuthenticated || !authResult.coach) {
        setSaveStatus(prev => ({ ...prev, [recordId]: 'error' }))
        setError("Authentication required")
        return
      }

      const record = attendanceRecords.find(r => r.id === recordId)
      if (!record) {
        setSaveStatus(prev => ({ ...prev, [recordId]: 'error' }))
        setError("Attendance record not found")
        return
      }

      // Update local state immediately for better UX
      setAttendanceRecords(prev =>
        prev.map(r =>
          r.id === recordId
            ? {
                ...r,
                status,
                check_in_time: status !== "absent" ? new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }) : undefined
              }
            : r
        )
      )

      // Update filtered records as well
      setFilteredRecords(prev =>
        prev.map(r =>
          r.id === recordId
            ? {
                ...r,
                status,
                check_in_time: status !== "absent" ? new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }) : undefined
              }
            : r
        )
      )

      // Update attendance stats
      const updatedRecords = attendanceRecords.map(r =>
        r.id === recordId ? { ...r, status } : r
      )

      const stats: AttendanceStats = {
        total_students: updatedRecords.length,
        present_today: updatedRecords.filter(r => r.status === "present").length,
        absent_today: updatedRecords.filter(r => r.status === "absent").length,
        late_today: updatedRecords.filter(r => r.status === "late").length,
        attendance_rate: updatedRecords.length > 0 ?
          (updatedRecords.filter(r => r.status === "present" || r.status === "late").length / updatedRecords.length) * 100 : 0
      }
      setAttendanceStats(stats)

      // Mark as having unsaved changes (no immediate save to backend)
      setHasUnsavedChanges(true)
      setSaveStatus(prev => ({ ...prev, [recordId]: 'success' }))
      console.log("📝 Attendance status updated locally - marked as unsaved for bulk save")

      // Clear save status after 3 seconds
      setTimeout(() => {
        setSaveStatus(prev => {
          const newStatus = { ...prev }
          delete newStatus[recordId]
          return newStatus
        })
      }, 3000)

    } catch (error) {
      console.error("Error marking attendance:", error)
      setSaveStatus(prev => ({ ...prev, [recordId]: 'error' }))
      setError("Failed to mark attendance")
    }
  }

  const handleSaveAttendance = async () => {
    try {
      setBulkSaving(true)
      setError(null)
      setSuccessMessage(null)

      const authResult = checkCoachAuth()
      if (!authResult.isAuthenticated || !authResult.coach) {
        setError("Authentication required")
        return
      }

      let successCount = 0
      let errorCount = 0

      console.log("💾 Starting to save attendance records to backend...")

      // Save all attendance records to backend
      for (const record of filteredRecords) {
        try {
          const attendanceData = {
            user_id: record.student_id,
            user_type: "student",
            course_id: record.course_id,
            branch_id: authResult.coach.branch_id || "",
            attendance_date: selectedDate.toISOString(),
            status: record.status,
            check_in_time: record.status !== "absent" ? new Date().toISOString() : null,
            notes: `Saved by coach: ${authResult.coach.full_name} for ${format(selectedDate, "PPP")}`
          }

          console.log(`💾 Saving attendance for ${record.student_name} with status: ${record.status}`)

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/attendance/mark`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("access_token") || localStorage.getItem("token")}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(attendanceData)
          })

          if (response.ok) {
            successCount++
            console.log(`✅ Successfully saved attendance for ${record.student_name}`)
          } else {
            errorCount++
            const errorText = await response.text()
            console.warn(`❌ Failed to save attendance for ${record.student_name}: ${response.status} ${errorText}`)
          }
        } catch (error) {
          errorCount++
          console.error(`❌ Error saving attendance for ${record.student_name}:`, error)
        }
      }

      // Show result message
      if (errorCount === 0) {
        setError(null)
        console.log(`✅ Successfully saved attendance for all ${successCount} students`)
        // Show success message briefly
        setSuccessMessage(`Successfully saved attendance for all ${successCount} students`)
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        const message = `⚠️ Saved ${successCount} records, ${errorCount} failed. Check console for details.`
        setError(message)
        console.warn(message)
      }

      // Clear unsaved changes flag
      setHasUnsavedChanges(false)

    } catch (error) {
      console.error("Error saving attendance records:", error)
      setError("Failed to save attendance records")
    } finally {
      setBulkSaving(false)
    }
  }

  const handleExportAttendance = async () => {
    try {
      const authResult = checkCoachAuth()
      if (!authResult.isAuthenticated || !authResult.coach) {
        setError("Authentication required")
        return
      }

      const headers = getCoachAuthHeaders()

      // Try to export from backend
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/attendance/export?format=csv`, {
          method: 'GET',
          headers
        })

        if (response.ok) {
          const data = await response.json()

          // Create and download CSV file
          const blob = new Blob([data.content], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = data.filename || 'attendance_report.csv'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)

          console.log("Attendance exported successfully")
          return
        }
      } catch (apiError) {
        console.warn("Backend export not available, using local data:", apiError)
      }

      // Fallback: Export local data as CSV
      const csvContent = [
        ['Student Name', 'Course', 'Date', 'Status', 'Check In', 'Check Out', 'Notes'].join(','),
        ...filteredRecords.map(record => [
          record.student_name,
          record.course_name,
          record.date,
          record.status,
          record.check_in_time || '',
          record.check_out_time || '',
          record.notes || ''
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      console.log("Local attendance data exported successfully")
    } catch (error) {
      console.error("Error exporting attendance:", error)
      setError("Failed to export attendance data")
    }
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
                  <p className="text-sm mt-1">{error || "No attendance statistics available"}</p>

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
              {hasUnsavedChanges && (
                <Button
                  onClick={handleSaveAttendance}
                  disabled={bulkSaving}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {bulkSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Attendance
                    </>
                  )}
                </Button>
              )}

              <Button onClick={handleExportAttendance} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              {viewMode === 'today' ? (
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
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(startDate, "MMM dd")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => setStartDate(date || startDate)}
                      />
                    </PopoverContent>
                  </Popover>
                  <span className="flex items-center text-gray-500">to</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(endDate, "MMM dd")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => setEndDate(date || endDate)}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button onClick={fetchHistoricalAttendance} disabled={loadingHistorical}>
                    {loadingHistorical ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Load Records
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-lg">
              <Button
                variant={viewMode === 'today' ? 'default' : 'ghost'}
                onClick={() => setViewMode('today')}
                className="mr-1"
              >
                Today's Attendance
              </Button>
              <Button
                variant={viewMode === 'historical' ? 'default' : 'ghost'}
                onClick={() => setViewMode('historical')}
              >
                Historical Records
              </Button>
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
            {hasUnsavedChanges && (
              <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                <span className="font-medium">Unsaved changes detected</span> - Click "Save All Changes" to persist your attendance markings
              </div>
            )}
          </div>

          {/* Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle>
                {viewMode === 'today'
                  ? `Attendance for ${format(selectedDate, "PPP")}`
                  : `Historical Records (${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")})`
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {viewMode === 'today' ? (
                  // Today's attendance view
                  filteredRecords.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? "No records match your search." : `No attendance records found for ${format(selectedDate, "PPP")}.`}
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
                            disabled={saveStatus[record.id] === 'saving'}
                            className="text-xs"
                          >
                            {saveStatus[record.id] === 'saving' ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Present"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant={record.status === "late" ? "default" : "outline"}
                            onClick={() => handleMarkAttendance(record.id, "late")}
                            disabled={saveStatus[record.id] === 'saving'}
                            className="text-xs"
                          >
                            {saveStatus[record.id] === 'saving' ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Late"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant={record.status === "absent" ? "default" : "outline"}
                            onClick={() => handleMarkAttendance(record.id, "absent")}
                            disabled={saveStatus[record.id] === 'saving'}
                            className="text-xs"
                          >
                            {saveStatus[record.id] === 'saving' ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Absent"
                            )}
                          </Button>
                        </div>

                        {/* Save Status Indicator */}
                        {saveStatus[record.id] && (
                          <div className="flex items-center ml-2">
                            {saveStatus[record.id] === 'success' && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                            {saveStatus[record.id] === 'error' && (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        )}
                        
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
                )
                ) : (
                  // Historical records view
                  loadingHistorical ? (
                    <div className="text-center py-8">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-yellow-600" />
                      <p className="mt-2 text-sm text-gray-600">Loading historical records...</p>
                    </div>
                  ) : historicalRecords.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No historical records found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No attendance records found for the selected date range. Try adjusting the dates or check if attendance was recorded during this period.
                      </p>
                    </div>
                  ) : (
                    historicalRecords
                      .filter(record =>
                        searchTerm === "" ||
                        record.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        record.course_name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h3 className="font-medium text-gray-900">{record.student_name}</h3>
                                <p className="text-sm text-gray-600">{record.course_name}</p>
                                <p className="text-xs text-gray-500">{record.date}</p>
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

                            {record.notes && (
                              <div className="text-center max-w-32">
                                <p className="text-xs text-gray-500">Notes</p>
                                <p className="text-sm text-gray-700 truncate" title={record.notes}>{record.notes}</p>
                              </div>
                            )}

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
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
