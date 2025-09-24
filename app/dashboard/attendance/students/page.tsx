"use client"
import {
  BarChart,
  Bar,
  XAxis,
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
import { Search } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import DashboardHeader from "@/components/dashboard-header"

const students = {
  male: 6,
  female: 4,
}

const total = students.male + students.female

// ✅ Normalize values to percentages
const genderData = [
  {
    name: "Male",
    value: (students.male / total) * 100,
    fill: "#3B82F6", // blue
  },
  {
    name: "Female",
    value: (students.female / total) * 100,
    fill: "#A855F7", // purple
  },
]

export default function StudentAttendancePage() {
  const router = useRouter()
  const [selectedFilter, setSelectedFilter] = useState("filter")
  const [selectedMonth, setSelectedMonth] = useState("april")
  const [activeTab, setActiveTab] = useState("day")

  const attendanceData = [
  { week: "Jan week-1", Present: 40, Absent: 20 },
  { week: "Jan week-2", Present: 30, Absent: 35 },
  { week: "Jan week-3", Present: 35, Absent: 15 },
  { week: "Jan week-4", Present: 25, Absent: 30 },
  { week: "Feb week-1", Present: 45, Absent: 25 },

]

const genderData = [
  { name: "Male", value: 311, fill: "#3B82F6" },   // Blue
  { name: "Female", value: 333, fill: "#A855F7" }, // Purple
]

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
            <tr className="border-b text-[#6B7A99]">
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
              <tr key={index} className="border-b text-[#6B7A99]">
                <td className="py-3 font-semibold">{student.name}</td>
                <td className="py-3 font-semibold">{student.course}</td>
                <td className="py-3 font-semibold">{student.branch}</td>
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

      <main className="w-full p-4 lg:p-6 overflow-x-hidden xl:px-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#4D5077]">Attendance Tracker</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
              <Card className="shaddow-md">
                <CardContent className="px-6 py-4 h-full">
                  <div className="text-start">
                    <p className="text-sm text-[#9593A8] mb-3">Total No. students</p>
                    <p className="text-2xl text-[#403C6B] font-bold">347</p>
                    <p className="text-xs text-[#9593A8]">In last 24 hours</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shaddow-md">
                <CardContent className="px-6 py-4 h-full">
                  <div className="text-start">
                    <p className="text-sm text-[#9593A8] mb-3">Absent today</p>
                    <p className="text-2xl text-[#403C6B] font-bold">43</p>
                    <p className="text-xs text-[#9593A8]">In last 24 hours</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shaddow-md">
                <CardContent className="px-6 py-4 h-full">
                  <div className="text-start">
                    <p className="text-sm text-[#9593A8] mb-3">Present Today</p>
                    <p className="text-2xl text-[#403C6B] font-bold">344</p>
                    <p className="text-xs text-[#9593A8]">In last 24 hours</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shaddow-md">
                <CardContent className="px-6 py-4 h-full">
                  <div className="text-start">
                    <p className="text-sm text-[#9593A8] mb-3">Leave request</p>
                    <p className="text-2xl text-[#403C6B] font-bold">9</p>
                    <p className="text-xs text-[#9593A8]">In last 24 hours</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Status Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center text-[#0A1629]">
                    <CardTitle>Attendance Status - April-2025</CardTitle>
                    <Button variant="link" className="text-blue-600 border border-gray-200" onClick={handleViewReport}>
                      View Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
        
                     {/* ✅ Recharts Bar Chart */}
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={attendanceData} barSize={18}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="week" />
          <Tooltip />
          <Legend />
          <Bar dataKey="Present" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
                </CardContent>
              </Card>

 <Card>
      <CardHeader>
        <CardTitle>Students</CardTitle>
        <p className="text-sm text-[#7D8592]">
          Total Student Gender Distribution
        </p>
      </CardHeader>
      <CardContent>
        {/* Circular Gender Chart */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                barSize={12}
                data={genderData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]} // ✅ 100% total
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  dataKey="value"
                  cornerRadius={5}
                  background={{ fill: "#E5E7EB" }}
                />
              </RadialBarChart>
            </ResponsiveContainer>

            {/* Center icons */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-2">
                <span className="text-2xl text-blue-500">♂</span>
                <span className="text-2xl text-purple-500">♀</span>
              </div>
            </div>
          </div>
        </div>

        {/* Counts */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-500">{students.male}</p>
            <p className="text-sm text-gray-600">Male</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-500">{students.female}</p>
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
                  <CardTitle className="text-[#0A1629] text-lg">student wise attendance</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="link" className="text-blue-600 border border-gray-200" onClick={handleViewReport}>
                      View Report
                    </Button>
                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                        <SelectTrigger className="w-24 bg-[#F1F1F1] text-[#9593A8]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="filter">Filter by</SelectItem>
                        <SelectItem value="branch">Branch</SelectItem>
                        <SelectItem value="course">Course</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-32 bg-[#F1F1F1] text-[#9593A8]">
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
                <CardTitle className="text-[#0A1629]">Recent Activity</CardTitle>
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
                        {/* <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div> */}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1B83FE]">{activity.type}</p>
                          <p className="text-xs text-black mt-1">
                            {activity.action}{" "}
                            {activity.id && <span className="font-medium">Confirm {activity.id}</span>}
                          </p>
                          <p className="text-xs text-[#9593A8] mt-1">{activity.time}</p>
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
