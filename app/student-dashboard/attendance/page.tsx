"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import StudentDashboardLayout from "@/components/student-dashboard-layout"
import { CardSkeleton, TableSkeleton } from "@/components/ui/loading-skeleton"
import { ErrorBoundary } from "@/components/error-boundary"
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  Target
} from "lucide-react"

export default function StudentAttendancePage() {
  const router = useRouter()
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    
    if (!token) {
      router.push("/login")
      return
    }

    // Try to get user data from localStorage
    if (user) {
      try {
        const userData = JSON.parse(user)
        
        // Check if user is actually a student
        if (userData.role !== "student") {
          if (userData.role === "coach") {
            router.push("/coach-dashboard")
          } else {
            router.push("/dashboard")
          }
          return
        }
        
        setStudentData({
          name: userData.full_name || `${userData.first_name} ${userData.last_name}` || userData.name || "Student",
          email: userData.email || "student@example.com",
        })
      } catch (error) {
        console.error("Error parsing user data:", error)
        setStudentData({
          name: "Student",
          email: "student@example.com",
        })
      }
    } else {
      setStudentData({
        name: "Student",
        email: "student@example.com",
      })
    }
    
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  // Mock attendance data - replace with actual API call
  const attendanceRecords = [
    {
      id: 1,
      date: "2024-01-15",
      course: "Shaolin Kung Fu",
      status: "present",
      checkIn: "06:00 PM",
      checkOut: "07:30 PM"
    },
    {
      id: 2,
      date: "2024-01-14",
      course: "Taekwondo",
      status: "present",
      checkIn: "07:00 PM",
      checkOut: "08:30 PM"
    },
    {
      id: 3,
      date: "2024-01-13",
      course: "Shaolin Kung Fu",
      status: "absent",
      checkIn: "-",
      checkOut: "-"
    },
    {
      id: 4,
      date: "2024-01-12",
      course: "Kick Boxing",
      status: "present",
      checkIn: "05:30 PM",
      checkOut: "07:00 PM"
    },
    {
      id: 5,
      date: "2024-01-11",
      course: "Taekwondo",
      status: "late",
      checkIn: "07:15 PM",
      checkOut: "08:30 PM"
    }
  ]

  const attendanceStats = {
    totalClasses: 25,
    attended: 20,
    absent: 3,
    late: 2,
    percentage: 80
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
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <StudentDashboardLayout
      pageTitle="Attendance"
      pageDescription="Track your class attendance and punctuality"
      showBreadcrumb={true}
      breadcrumbItems={[
        { label: "Dashboard", href: "/student-dashboard" },
        { label: "Attendance" }
      ]}
    >

          {/* Attendance Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{attendanceStats.totalClasses}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Classes</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{attendanceStats.attended}</p>
                  <p className="text-sm text-gray-500 mt-1">Attended</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
                  <p className="text-sm text-gray-500 mt-1">Absent</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</p>
                  <p className="text-sm text-gray-500 mt-1">Late</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{attendanceStats.percentage}%</p>
                  <p className="text-sm text-gray-500 mt-1">Attendance Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0A1629]">Attendance</CardTitle>
              <CardDescription>Your attendance history for the past classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold  text-[#6B7A99]">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#6B7A99]">Course</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#6B7A99]">Status</th>
                      <th className="text-left py-3 px-4 font-semibold  text-[#6B7A99]">Check In</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#6B7A99]">Check Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-[#000000] font-normal text-xs">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-[#000000] font-normal text-xs">{record.course}</td>
                        <td className="py-3 px-4  text-xs">{getStatusBadge(record.status)}</td>
                        <td className="py-3 px-4 text-[#000000] font-normal text-xs">{record.checkIn}</td>
                        <td className="py-3 px-4 text-[#000000] font-normal text-xs">{record.checkOut}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
    </StudentDashboardLayout>
  )
}
