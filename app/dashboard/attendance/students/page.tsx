"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import DashboardHeader from "@/components/dashboard-header"

export default function StudentAttendancePage() {
  const router = useRouter()
  const [selectedFilter, setSelectedFilter] = useState("filter")
  const [selectedMonth, setSelectedMonth] = useState("april")
  const [activeTab, setActiveTab] = useState("day")

  const dailyAttendanceData = [
    {
      name: "Krishna Kumar Jit",
      course: "Martial arts",
      branch: "Madhapur",
      present: "Yes",
      absent: "No",
      leave: "No",
      notes: "Double punch",
    },
    {
      name: "Arun.K",
      course: "Martial arts",
      branch: "Malkajgiri",
      present: "-",
      absent: "No",
      leave: "No",
      notes: "Missed punch",
    },
    {
      name: "Priya Sharma",
      course: "Karate",
      branch: "Madhapur",
      present: "Yes",
      absent: "No",
      leave: "No",
      notes: "Perfect form",
    },
    {
      name: "Raj Patel",
      course: "Kung Fu",
      branch: "Yapral",
      present: "No",
      absent: "Yes",
      leave: "No",
      notes: "Sick leave",
    },
    {
      name: "Sneha Reddy",
      course: "Taekwondo",
      branch: "Tarnaka",
      present: "Yes",
      absent: "No",
      leave: "No",
      notes: "Excellent kicks",
    },
    {
      name: "Vikram Singh",
      course: "Boxing",
      branch: "Balaji Nagar",
      present: "Yes",
      absent: "No",
      leave: "No",
      notes: "Good technique",
    },
  ]

  const weeklyAttendanceData = [
    {
      name: "Krishna Kumar Jit",
      course: "Martial arts",
      branch: "Madhapur",
      present: "5/7",
      absent: "2/7",
      leave: "0/7",
      notes: "Good week",
    },
    {
      name: "Arun.K",
      course: "Martial arts",
      branch: "Malkajgiri",
      present: "4/7",
      absent: "3/7",
      leave: "0/7",
      notes: "Needs improvement",
    },
    {
      name: "Priya Sharma",
      course: "Karate",
      branch: "Madhapur",
      present: "7/7",
      absent: "0/7",
      leave: "0/7",
      notes: "Perfect attendance",
    },
    {
      name: "Raj Patel",
      course: "Kung Fu",
      branch: "Yapral",
      present: "3/7",
      absent: "3/7",
      leave: "1/7",
      notes: "Medical leave",
    },
    {
      name: "Sneha Reddy",
      course: "Taekwondo",
      branch: "Tarnaka",
      present: "6/7",
      absent: "1/7",
      leave: "0/7",
      notes: "Consistent",
    },
  ]

  const monthlyAttendanceData = [
    {
      name: "Krishna Kumar Jit",
      course: "Martial arts",
      branch: "Madhapur",
      present: "22/30",
      absent: "6/30",
      leave: "2/30",
      notes: "73% attendance",
    },
    {
      name: "Arun.K",
      course: "Martial arts",
      branch: "Malkajgiri",
      present: "18/30",
      absent: "10/30",
      leave: "2/30",
      notes: "60% attendance",
    },
    {
      name: "Priya Sharma",
      course: "Karate",
      branch: "Madhapur",
      present: "28/30",
      absent: "2/30",
      leave: "0/30",
      notes: "93% attendance",
    },
    {
      name: "Raj Patel",
      course: "Kung Fu",
      branch: "Yapral",
      present: "15/30",
      absent: "12/30",
      leave: "3/30",
      notes: "50% attendance",
    },
    {
      name: "Sneha Reddy",
      course: "Taekwondo",
      branch: "Tarnaka",
      present: "25/30",
      absent: "3/30",
      leave: "2/30",
      notes: "83% attendance",
    },
  ]

  const getAttendanceData = () => {
    switch (activeTab) {
      case "day":
        return dailyAttendanceData
      case "week":
        return weeklyAttendanceData
      case "month":
        return monthlyAttendanceData
      default:
        return dailyAttendanceData
    }
  }

  const getFilteredData = () => {
    const data = getAttendanceData()

    if (selectedFilter === "branch") {
      // Filter by branch if needed
      return data
    } else if (selectedFilter === "course") {
      // Filter by course if needed
      return data
    }

    return data
  }

  const handleReportDownload = (studentName: string) => {
    const studentData = getFilteredData().find((student) => student.name === studentName)

    if (!studentData) {
      console.log(`[v0] Student data not found for ${studentName}`)
      return
    }

    // Create PDF content
    const generatePDFContent = () => {
      const currentDate = new Date().toLocaleDateString()
      const reportPeriod = activeTab.charAt(0).toUpperCase() + activeTab.slice(1)

      return `
ROCK MARTIAL ARTS ACADEMY
Student Attendance Report

Generated on: ${currentDate}
Report Period: ${reportPeriod}ly Report
Month: ${selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)} 2025

STUDENT INFORMATION
Name: ${studentData.name}
Course: ${studentData.course}
Branch: ${studentData.branch}

ATTENDANCE SUMMARY
Present: ${studentData.present}
Absent: ${studentData.absent}
Leave: ${studentData.leave}
Notes: ${studentData.notes}

ATTENDANCE STATISTICS
${
  activeTab === "day"
    ? "Daily Attendance Status"
    : activeTab === "week"
      ? "Weekly Attendance Summary"
      : "Monthly Attendance Overview"
}

Performance Notes:
${studentData.notes}

This report was generated automatically by the Rock Martial Arts Academy attendance management system.

For any queries, please contact the administration office.
      `.trim()
    }

    // Create and download PDF using browser's built-in functionality
    const pdfContent = generatePDFContent()
    const blob = new Blob([pdfContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `${studentName.replace(/\s+/g, "_")}_Attendance_Report_${activeTab}_${selectedMonth}_2025.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    console.log(`[v0] Downloaded attendance report for ${studentName}`)
  }

  const handleViewReport = () => {
    const allStudentsData = getFilteredData()
    const currentDate = new Date().toLocaleDateString()
    const reportPeriod = activeTab.charAt(0).toUpperCase() + activeTab.slice(1)

    const generateSummaryReport = () => {
      let reportContent = `
ROCK MARTIAL ARTS ACADEMY
${reportPeriod}ly Attendance Summary Report

Generated on: ${currentDate}
Report Period: ${selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)} 2025
Filter: ${selectedFilter === "filter" ? "All Students" : selectedFilter}

ATTENDANCE OVERVIEW
Total Students: ${allStudentsData.length}
Report Type: ${reportPeriod}ly Summary

STUDENT ATTENDANCE DETAILS
${"=".repeat(80)}
`

      allStudentsData.forEach((student, index) => {
        reportContent += `
${index + 1}. ${student.name}
   Course: ${student.course}
   Branch: ${student.branch}
   Present: ${student.present} | Absent: ${student.absent} | Leave: ${student.leave}
   Notes: ${student.notes}
   ${"-".repeat(60)}
`
      })

      reportContent += `
${"=".repeat(80)}
SUMMARY STATISTICS
- Total Records: ${allStudentsData.length}
- Report Generated: ${currentDate}
- Period: ${reportPeriod}ly
- Month: ${selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)} 2025

This comprehensive report includes all student attendance data for the selected period.
For detailed individual reports, use the Report button next to each student's record.

Rock Martial Arts Academy - Attendance Management System
      `.trim()

      return reportContent
    }

    const summaryContent = generateSummaryReport()
    const blob = new Blob([summaryContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `Attendance_Summary_Report_${activeTab}_${selectedMonth}_2025.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    console.log(`[v0] Downloaded summary attendance report for ${reportPeriod}`)
  }

  const renderAttendanceTable = () => {
    const data = getFilteredData()

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Student Name</th>
              <th className="text-left py-3">Course</th>
              <th className="text-left py-3">Branch</th>
              <th className="text-left py-3">Present</th>
              <th className="text-left py-3">Absent</th>
              <th className="text-left py-3">Leave</th>
              <th className="text-left py-3">Notes</th>
              <th className="text-left py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((student, index) => (
              <tr key={index} className="border-b">
                <td className="py-3">{student.name}</td>
                <td className="py-3">{student.course}</td>
                <td className="py-3">{student.branch}</td>
                <td className="py-3">{student.present}</td>
                <td className="py-3">{student.absent}</td>
                <td className="py-3">{student.leave}</td>
                <td className="py-3">
                  <span
                    className={`text-sm ${
                      student.notes.includes("Perfect") ||
                      student.notes.includes("Excellent") ||
                      student.notes.includes("Good")
                        ? "text-green-600"
                        : student.notes.includes("Missed") ||
                            student.notes.includes("Sick") ||
                            student.notes.includes("improvement")
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {student.notes}
                  </span>
                </td>
                <td className="py-3">
                  <Button
                    className="bg-yellow-400 hover:bg-yellow-500 text-black text-xs px-3 py-1"
                    onClick={() => handleReportDownload(student.name)}
                  >
                    Report
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <DashboardHeader currentPage="Student Attendance" />

      <main className="w-full p-4 lg:p-6 overflow-x-hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Attendance Tracker</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Total No. students</p>
                    <p className="text-2xl font-bold">347</p>
                    <p className="text-xs text-gray-500">In last 24 hours</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Absent today</p>
                    <p className="text-2xl font-bold">43</p>
                    <p className="text-xs text-gray-500">In last 24 hours</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Present Today</p>
                    <p className="text-2xl font-bold">344</p>
                    <p className="text-xs text-gray-500">In last 24 hours</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Leave request</p>
                    <p className="text-2xl font-bold">9</p>
                    <p className="text-xs text-gray-500">In last 24 hours</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Status Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Attendance Status - April-2025</CardTitle>
                    <Button variant="link" className="text-blue-600" onClick={handleViewReport}>
                      View Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center bg-gray-50 rounded mb-4">
                    <p className="text-gray-500">Attendance Chart Placeholder</p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-sm">Present</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-sm">Absent</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Students</CardTitle>
                  <p className="text-sm text-gray-600">Total Student Gender Distribution</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-32 h-32">
                      <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">♂</span>
                            </div>
                            <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">♀</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">311</p>
                      <p className="text-sm text-gray-600">Male</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">333</p>
                      <p className="text-sm text-gray-600">Female</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Student Wise Attendance */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>student wise attendance</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="link" className="text-blue-600" onClick={handleViewReport}>
                      View Report
                    </Button>
                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="filter">Filter by</SelectItem>
                        <SelectItem value="branch">Branch</SelectItem>
                        <SelectItem value="course">Course</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="april">April 2025</SelectItem>
                        <SelectItem value="march">March 2025</SelectItem>
                        <SelectItem value="may">May 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger
                      value="day"
                      className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
                    >
                      Day
                    </TabsTrigger>
                    <TabsTrigger
                      value="week"
                      className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
                    >
                      Week
                    </TabsTrigger>
                    <TabsTrigger
                      value="month"
                      className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
                    >
                      Month
                    </TabsTrigger>
                    <TabsTrigger
                      value="customize"
                      className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
                    >
                      Customize
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="day" className="mt-4">
                    {renderAttendanceTable()}
                  </TabsContent>

                  <TabsContent value="week" className="mt-4">
                    {renderAttendanceTable()}
                  </TabsContent>

                  <TabsContent value="month" className="mt-4">
                    {renderAttendanceTable()}
                  </TabsContent>

                  <TabsContent value="customize" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Input type="date" className="w-40" placeholder="Start Date" />
                        <Input type="date" className="w-40" placeholder="End Date" />
                        <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">Apply Filter</Button>
                      </div>
                      {renderAttendanceTable()}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      type: "Super Admin",
                      action: "Collected a Paid amount of 7500 from",
                      id: "9948203546",
                      time: "20 Apr 2025, 06:24:36 PM",
                    },
                    {
                      type: "Student",
                      action: "Today's attendance recorded 19-04-2025",
                      time: "19 Apr 2025, 06:24:36 AM",
                    },
                    {
                      type: "Student",
                      action:
                        "Today's attendance recorded, double punch, Madhapur branch, Sreekamth ch student 19-04-2025",
                      time: "19 Apr 2025, 06:24:36 AM",
                    },
                    {
                      type: "Super Admin",
                      action: "Collected a Paid amount of 7500 from",
                      id: "9948203546",
                      time: "20 Apr 2025, 06:24:36 PM",
                    },
                    {
                      type: "Student",
                      action: "Today's attendance recorded 19-04-2025",
                      time: "19 Apr 2025, 06:24:36 AM",
                    },
                  ].map((activity, index) => (
                    <div key={index} className="border-b pb-3 last:border-b-0">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-600">{activity.type}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {activity.action}{" "}
                            {activity.id && <span className="font-medium">Confirm {activity.id}</span>}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
