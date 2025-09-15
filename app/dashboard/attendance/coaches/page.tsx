"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MessageCircle, Phone } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState } from "react"
import DashboardHeader from "@/components/dashboard-header"

export default function CoachAttendancePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("master")

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
      <DashboardHeader currentPage="Coach Attendance" />

      <main className="w-full p-4 lg:p-6 overflow-x-hidden">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <div className="flex flex-wrap gap-2 lg:gap-3">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black text-sm">Send Alerts</Button>
            <Button variant="outline" className="text-sm bg-transparent">
              View Report
            </Button>
            <Button variant="outline" className="text-sm flex items-center space-x-2 bg-transparent">
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
                  ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }
            >
              Student Attendance
            </Button>
            <Button
              onClick={() => setActiveTab("master")}
              className={
                activeTab === "master"
                  ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
              <h2 className="text-lg font-semibold">
                {activeTab === "student" ? "Student Attendance" : "Master Attendance"}
              </h2>
              <div className="flex flex-wrap gap-2 lg:gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Branch:</span>
                  <Select defaultValue="select-branch">
                    <SelectTrigger className="w-32">
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
                  <span className="text-sm text-gray-600">Select Month:</span>
                  <Select defaultValue="april">
                    <SelectTrigger className="w-24">
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
                    <SelectTrigger className="w-20">
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

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">
                      {activeTab === "student" ? "Student Name" : "Coach Name"}
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Gender</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Expertise</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Email Id</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Date of join</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Check in</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Check out</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Attendance</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">
                      {activeTab === "student" ? "Notes" : "Alerts"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === "student"
                    ? studentAttendanceData.map((student, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2">{student.date}</td>
                          <td className="py-3 px-2">{student.studentName}</td>
                          <td className="py-3 px-2">{student.gender}</td>
                          <td className="py-3 px-2">{student.expertise}</td>
                          <td className="py-3 px-2">{student.email}</td>
                          <td className="py-3 px-2">{student.dateOfJoin}</td>
                          <td className="py-3 px-2">{student.checkIn}</td>
                          <td className="py-3 px-2">{student.checkOut}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center space-x-2">
                              <span>{student.attendance}</span>
                              <Badge
                                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer"
                                onClick={() => router.push(`/dashboard/attendance/student-detail/${index}`)}
                              >
                                View more
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                student.notes === "Double punch" ||
                                student.notes === "Perfect form" ||
                                student.notes === "Excellent technique"
                                  ? "bg-green-100 text-green-800"
                                  : student.notes === "Missed punch"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {student.notes}
                            </span>
                          </td>
                        </tr>
                      ))
                    : coachAttendanceData.map((coach, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2">{coach.date}</td>
                          <td className="py-3 px-2">{coach.coachName}</td>
                          <td className="py-3 px-2">{coach.gender}</td>
                          <td className="py-3 px-2">{coach.expertise}</td>
                          <td className="py-3 px-2">{coach.email}</td>
                          <td className="py-3 px-2">{coach.dateOfJoin}</td>
                          <td className="py-3 px-2">{coach.checkIn}</td>
                          <td className="py-3 px-2">{coach.checkOut}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center space-x-2">
                              <span>{coach.attendance}</span>
                              <Badge
                                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer"
                                onClick={() => router.push(`/dashboard/attendance/coach-detail/${index}`)}
                              >
                                View more
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                <MessageCircle className="w-4 h-4 text-green-600" />
                              </div>
                              <span className="text-xs text-gray-500">WhatsApp</span>
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                <Phone className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-xs text-gray-500">SMS</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
