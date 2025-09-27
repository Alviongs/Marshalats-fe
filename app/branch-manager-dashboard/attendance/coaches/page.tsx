"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MessageCircle, Phone, CheckCircle, XCircle, Clock, Download, Calendar as CalendarIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { checkBranchManagerAuth, getBranchManagerAuthHeaders } from "@/lib/branchManagerAuth"

interface Coach {
  id: string
  full_name: string
  email: string
  phone?: string
  expertise?: string
  branch_id?: string
  attendance_status?: "present" | "absent" | "late"
  check_in_time?: string
  check_out_time?: string
  notes?: string
  date_of_join?: string
}

interface CoachAttendanceStats {
  total_coaches: number
  present_today: number
  absent_today: number
  late_today: number
  attendance_rate: number
}

export default function BranchManagerCoachAttendancePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("master")

  // New state for coach attendance management
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [attendanceStats, setAttendanceStats] = useState<CoachAttendanceStats>({
    total_coaches: 0,
    present_today: 0,
    absent_today: 0,
    late_today: 0,
    attendance_rate: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Filter coaches based on search term
  const filteredCoaches = coaches.filter(coach =>
    coach.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (coach.expertise && coach.expertise.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Fetch coaches and attendance data
  const fetchCoachesAndAttendance = async () => {
    setLoading(true)
    setError(null)

    try {
      const authResult = checkBranchManagerAuth()
      if (!authResult.isAuthenticated || !authResult.user) {
        setError("Authentication required")
        return
      }

      const headers = getBranchManagerAuthHeaders()

      // Fetch coaches in branch
      const coachesResponse = await fetch('http://localhost:8003/api/attendance/coaches', {
        method: 'GET',
        headers
      })

      if (coachesResponse.ok) {
        const coachesData = await coachesResponse.json()
        const coachesWithAttendance = (coachesData.coaches || []).map((coach: any) => ({
          id: coach.coach_id || coach.id,
          full_name: coach.coach_name || coach.full_name,
          email: coach.email,
          phone: coach.phone,
          expertise: coach.expertise || coach.specialization,
          branch_id: coach.branch_id,
          attendance_status: "present", // Default status
          check_in_time: "",
          check_out_time: "",
          notes: "",
          date_of_join: coach.date_of_join || coach.created_at
        }))

        setCoaches(coachesWithAttendance)
      }

      // Fetch attendance statistics for coaches
      const statsResponse = await fetch('http://localhost:8003/api/attendance/stats?user_type=coach', {
        method: 'GET',
        headers
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setAttendanceStats({
          total_coaches: statsData.total_coaches || 0,
          present_today: statsData.today_present_coaches || 0,
          absent_today: (statsData.total_coaches || 0) - (statsData.today_present_coaches || 0),
          late_today: 0,
          attendance_rate: statsData.average_coach_attendance || 0
        })
      }

    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load coach attendance data. Using mock data for demonstration.")

      // Fallback mock data
      const mockCoaches: Coach[] = [
        {
          id: "1",
          full_name: "Abhi Ram",
          email: "abhi@example.com",
          phone: "123-456-7890",
          expertise: "Martial Arts",
          branch_id: "branch-1",
          attendance_status: "present",
          check_in_time: "06:30 AM",
          check_out_time: "09:00 AM",
          notes: "",
          date_of_join: "2025-04-20"
        },
        {
          id: "2",
          full_name: "Sarah Coach",
          email: "sarah.coach@example.com",
          phone: "123-456-7891",
          expertise: "Karate",
          branch_id: "branch-1",
          attendance_status: "late",
          check_in_time: "06:45 AM",
          notes: "Arrived 15 minutes late",
          date_of_join: "2025-03-15"
        }
      ]

      setCoaches(mockCoaches)
      setAttendanceStats({
        total_coaches: mockCoaches.length,
        present_today: 1,
        absent_today: 0,
        late_today: 1,
        attendance_rate: 90.5
      })
    } finally {
      setLoading(false)
    }
  }

  // Mark attendance for a coach
  const handleMarkCoachAttendance = async (coachId: string, status: "present" | "absent" | "late") => {
    try {
      const authResult = checkBranchManagerAuth()
      if (!authResult.isAuthenticated || !authResult.user) {
        setError("Authentication required")
        return
      }

      const coach = coaches.find(c => c.id === coachId)
      if (!coach) {
        setError("Coach not found")
        return
      }

      const headers = getBranchManagerAuthHeaders()

      // Prepare attendance data
      const attendanceData = {
        user_id: coachId,
        user_type: "coach",
        branch_id: coach.branch_id || authResult.user.branch_id || "",
        attendance_date: new Date().toISOString(),
        status: status,
        check_in_time: status !== "absent" ? new Date().toISOString() : null,
        notes: `Marked by branch manager: ${authResult.user.full_name}`
      }

      // Try to save to backend
      try {
        const response = await fetch('http://localhost:8003/api/attendance/coach/mark', {
          method: 'POST',
          headers,
          body: JSON.stringify(attendanceData)
        })

        if (response.ok) {
          console.log("Coach attendance marked successfully in backend")
        } else {
          console.warn("Failed to save to backend, updating locally only")
        }
      } catch (apiError) {
        console.warn("Backend not available, updating locally only:", apiError)
      }

      // Update local state
      setCoaches(prev =>
        prev.map(c =>
          c.id === coachId
            ? {
                ...c,
                attendance_status: status,
                check_in_time: status !== "absent" ? new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }) : "",
                notes: attendanceData.notes
              }
            : c
        )
      )

      // Update stats
      setAttendanceStats(prev => {
        const presentCount = coaches.filter(c => c.id === coachId ? status === "present" : c.attendance_status === "present").length
        const lateCount = coaches.filter(c => c.id === coachId ? status === "late" : c.attendance_status === "late").length
        const absentCount = coaches.length - presentCount - lateCount

        return {
          ...prev,
          present_today: presentCount,
          late_today: lateCount,
          absent_today: absentCount,
          attendance_rate: coaches.length > 0 ? (presentCount + lateCount) / coaches.length * 100 : 0
        }
      })

    } catch (error) {
      console.error("Error marking coach attendance:", error)
      setError("Failed to mark coach attendance")
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchCoachesAndAttendance()
  }, [selectedDate])

  // Sample coach attendance data
  const coachAttendanceData = [
    {
      date: "28/04/2025",
      coachName: "Abhi ram",
      gender: "Male",
      expertise: "Martial Arts",
      email: "Abhi@gmail.com",
      dateOfJoin: "20/04/2025",
      checkIn: "06:30 AM",
      checkOut: "09:00 AM",
      attendance: "90%",
    },
    // Repeat for multiple entries
    ...Array(10)
      .fill(null)
      .map((_, index) => ({
        date: "28/04/2025",
        coachName: "Abhi ram",
        gender: "Male",
        expertise: "Martial Arts",
        email: "Abhi@gmail.com",
        dateOfJoin: "20/04/2025",
        checkIn: "06:30 AM",
        checkOut: "09:00 AM",
        attendance: "90%",
      })),
  ]

  const studentAttendanceData = [
    {
      date: "28/04/2025",
      studentName: "Krishna Kumar Jit",
      gender: "Male",
      expertise: "Martial Arts",
      email: "krishna@gmail.com",
      dateOfJoin: "20/04/2025",
      checkIn: "06:30 AM",
      checkOut: "09:00 AM",
      attendance: "90%",
      notes: "Double punch",
    },
    {
      date: "28/04/2025",
      studentName: "Arun K",
      gender: "Female",
      expertise: "Martial Arts",
      email: "arun@gmail.com",
      dateOfJoin: "20/04/2025",
      checkIn: "06:30 AM",
      checkOut: "09:00 AM",
      attendance: "85%",
      notes: "Missed punch",
    },
    {
      date: "28/04/2025",
      studentName: "Priya Sharma",
      gender: "Female",
      expertise: "Karate",
      email: "priya@gmail.com",
      dateOfJoin: "15/04/2025",
      checkIn: "07:00 AM",
      checkOut: "09:30 AM",
      attendance: "95%",
      notes: "Perfect form",
    },
    {
      date: "28/04/2025",
      studentName: "Raj Patel",
      gender: "Male",
      expertise: "Taekwondo",
      email: "raj@gmail.com",
      dateOfJoin: "18/04/2025",
      checkIn: "06:45 AM",
      checkOut: "09:15 AM",
      attendance: "88%",
      notes: "Good progress",
    },
    {
      date: "28/04/2025",
      studentName: "Sneha Reddy",
      gender: "Female",
      expertise: "Kung Fu",
      email: "sneha@gmail.com",
      dateOfJoin: "22/04/2025",
      checkIn: "06:30 AM",
      checkOut: "09:00 AM",
      attendance: "92%",
      notes: "Excellent technique",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <BranchManagerDashboardHeader currentPage="Coach Attendance" />

      <main className="w-full p-4 lg:p-6 overflow-x-hidden xl:px-12">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-[#0A1629]">Attendance</h1>
          <div className="flex flex-wrap gap-2 lg:gap-3">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm">Send Alerts</Button>
            <Button variant="outline" className="text-sm bg-transparent text-[#5A6ACF]">
              View Report
            </Button>
            <Button variant="outline" className="text-sm flex items-center space-x-2 bg-transparent text-[#5A6ACF]">
              <span>📥</span>
              <span>Download attendance sheet</span>
            </Button>
          </div>
        </div>

        {/* Attendance Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <Button
              onClick={() => setActiveTab("student")}
              className={
                activeTab === "student"
                  ? "bg-yellow-400 hover:bg-yellow-500 text-white"
                  : "bg-[#D8E0F0] text-black hover:bg-gray-300"
              }
            >
              Student Attendance
            </Button>
            <Button
              onClick={() => setActiveTab("master")}
              className={
                activeTab === "master"
                  ? "bg-yellow-400 hover:bg-yellow-500 text-white"
                  : "bg-[#D8E0F0] text-black hover:bg-gray-300"
              }
            >
              Master Attendance
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Section Header with Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              <h2 className="text-lg font-semibold text-[#4F5077]">
                {activeTab === "student" ? "Student Attendance" : "Master Attendance"}
              </h2>
              <div className="flex flex-wrap gap-2 lg:gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-black">Branch:</span>
                  <Select defaultValue="select-branch">
                    <SelectTrigger className="w-32 bg-[#F1F1F1] text-[#9593A8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select-branch">Select branch</SelectItem>
                      <SelectItem value="madhapur">Madhapur</SelectItem>
                      <SelectItem value="hitech">Hitech City</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-[#6B7A99]">Select Month:</span>
                  <Select defaultValue="april">
                    <SelectTrigger className="w-24 bg-[#F1F1F1] text-[#9593A8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="april">April</SelectItem>
                      <SelectItem value="march">March</SelectItem>
                      <SelectItem value="may">May</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sort By:</span>
                  <Select defaultValue="today">
                    <SelectTrigger className="w-20 bg-[#F1F1F1] text-[#9593A8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Coach Attendance Management */}
            <div className="space-y-4">
              {/* Search and Date Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search coaches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="px-4 py-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Total Coaches</p>
                      <p className="text-2xl font-bold text-blue-600">{attendanceStats.total_coaches}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="px-4 py-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Present Today</p>
                      <p className="text-2xl font-bold text-green-600">{attendanceStats.present_today}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="px-4 py-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Absent Today</p>
                      <p className="text-2xl font-bold text-red-600">{attendanceStats.absent_today}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="px-4 py-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Late Today</p>
                      <p className="text-2xl font-bold text-yellow-600">{attendanceStats.late_today}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-500">Loading coaches...</div>
                </div>
              )}

              {error && (
                <div className="flex justify-center items-center py-8">
                  <div className="text-red-500">{error}</div>
                </div>
              )}

              {!loading && !error && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-2 font-semibold text-[#6B7A99]">Coach Name</th>
                        <th className="text-left py-3 px-2 font-semibold text-[#6B7A99]">Expertise</th>
                        <th className="text-left py-3 px-2 font-semibold text-[#6B7A99]">Email</th>
                        <th className="text-left py-3 px-2 font-semibold text-[#6B7A99]">Status</th>
                        <th className="text-left py-3 px-2 font-semibold text-[#6B7A99]">Check In</th>
                        <th className="text-left py-3 px-2 font-semibold text-[#6B7A99]">Notes</th>
                        <th className="text-left py-3 px-2 font-semibold text-[#6B7A99]">Mark Attendance</th>
                        <th className="text-left py-3 px-2 font-semibold text-[#6B7A99]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCoaches.map((coach) => {
                        const getStatusBadge = (status: string) => {
                          switch (status) {
                            case "present":
                              return <Badge className="bg-green-100 text-green-800">Present</Badge>
                            case "absent":
                              return <Badge className="bg-red-100 text-red-800">Absent</Badge>
                            case "late":
                              return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>
                            default:
                              return <Badge variant="outline">Not Marked</Badge>
                          }
                        }

                        return (
                          <tr key={coach.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src="" />
                                  <AvatarFallback className="bg-blue-100 text-blue-600">
                                    {coach.full_name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold">{coach.full_name}</div>
                                  <div className="text-xs text-gray-500">{coach.phone}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2">{coach.expertise || "N/A"}</td>
                            <td className="py-3 px-2">{coach.email}</td>
                            <td className="py-3 px-2">
                              {getStatusBadge(coach.attendance_status || "not_marked")}
                            </td>
                            <td className="py-3 px-2">{coach.check_in_time || "-"}</td>
                            <td className="py-3 px-2">
                              <span className="text-xs text-gray-600">
                                {coach.notes || "-"}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-200 hover:bg-green-50 px-2 py-1 text-xs"
                                  onClick={() => handleMarkCoachAttendance(coach.id, "present")}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Present
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 px-2 py-1 text-xs"
                                  onClick={() => handleMarkCoachAttendance(coach.id, "late")}
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  Late
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50 px-2 py-1 text-xs"
                                  onClick={() => handleMarkCoachAttendance(coach.id, "absent")}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Absent
                                </Button>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full cursor-pointer">
                                  <MessageCircle className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full cursor-pointer">
                                  <Phone className="w-4 h-4 text-blue-600" />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )
                      })}

                      {filteredCoaches.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-gray-500">
                            No coaches found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
