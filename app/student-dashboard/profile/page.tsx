"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import StudentDashboardHeader from "@/components/student-dashboard-header"
import { Edit, Mail, Phone, MapPin, Calendar, Award, Clock } from "lucide-react"

export default function StudentProfilePage() {
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
          phone: userData.phone || "+91 98765 43210",
          address: userData.address || "123 Main Street, City, State",
          dateOfBirth: userData.date_of_birth || "1995-06-15",
          joinDate: userData.created_at || "2023-01-15",
          studentId: userData.student_id || "STU001"
        })
      } catch (error) {
        console.error("Error parsing user data:", error)
        setStudentData({
          name: "Student",
          email: "student@example.com",
          phone: "+91 98765 43210",
          address: "123 Main Street, City, State",
          dateOfBirth: "1995-06-15",
          joinDate: "2023-01-15",
          studentId: "STU001"
        })
      }
    } else {
      setStudentData({
        name: "Student",
        email: "student@example.com",
        phone: "+91 98765 43210",
        address: "123 Main Street, City, State",
        dateOfBirth: "1995-06-15",
        joinDate: "2023-01-15",
        studentId: "STU001"
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

  // Mock profile data - replace with actual API call
  const profileStats = {
    coursesEnrolled: 3,
    totalHours: 135,
    attendanceRate: 85,
    currentBelt: "Yellow Belt"
  }

  const achievements = [
    { name: "First Class Completed", date: "2023-01-20", icon: "🎯" },
    { name: "Perfect Attendance - Month 1", date: "2023-02-01", icon: "📅" },
    { name: "Yellow Belt Achieved", date: "2023-03-15", icon: "🥋" },
    { name: "Sparring Champion", date: "2023-06-10", icon: "🏆" },
    { name: "100 Hours Milestone", date: "2023-08-22", icon: "⏰" }
  ]

  const enrolledCourses = [
    { name: "Shaolin Kung Fu", level: "Intermediate", instructor: "Master Chen", progress: 75 },
    { name: "Taekwondo", level: "Beginner", instructor: "Master Kim", progress: 45 },
    { name: "Kick Boxing", level: "Advanced", instructor: "Coach Johnson", progress: 90 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentDashboardHeader 
        studentName={studentData?.name || "Student"}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">View and manage your personal information</p>
            </div>
            <Button 
              onClick={() => router.push("/student-dashboard/profile/edit")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white text-2xl font-bold">
                      {studentData?.name?.charAt(0)?.toUpperCase() || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{studentData?.name}</CardTitle>
                  <CardDescription>Student ID: {studentData?.studentId}</CardDescription>
                  <Badge className="bg-yellow-100 text-yellow-800 mt-2">
                    {profileStats.currentBelt}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{studentData?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{studentData?.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{studentData?.address}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Born: {new Date(studentData?.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Joined: {new Date(studentData?.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Courses Enrolled</span>
                    <span className="font-semibold">{profileStats.coursesEnrolled}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Hours</span>
                    <span className="font-semibold">{profileStats.totalHours}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Attendance Rate</span>
                    <span className="font-semibold">{profileStats.attendanceRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Enrolled Courses */}
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Courses</CardTitle>
                  <CardDescription>Your current martial arts training programs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enrolledCourses.map((course, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900">{course.name}</h4>
                          <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {course.level}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Progress</p>
                          <p className="text-lg font-semibold text-blue-600">{course.progress}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Your martial arts milestones and accomplishments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                          <p className="text-sm text-gray-600">
                            Achieved on {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Award className="w-5 h-5 text-yellow-600" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Training History */}
              <Card>
                <CardHeader>
                  <CardTitle>Training History</CardTitle>
                  <CardDescription>Your martial arts journey timeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-2 border-yellow-400 pl-4 pb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full -ml-6"></div>
                        <span className="font-semibold text-gray-900">Started Kick Boxing</span>
                        <span className="text-sm text-gray-500">Advanced Level</span>
                      </div>
                      <p className="text-sm text-gray-600">August 2023</p>
                    </div>
                    <div className="border-l-2 border-blue-400 pl-4 pb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full -ml-6"></div>
                        <span className="font-semibold text-gray-900">Yellow Belt Promotion</span>
                        <span className="text-sm text-gray-500">Shaolin Kung Fu</span>
                      </div>
                      <p className="text-sm text-gray-600">March 2023</p>
                    </div>
                    <div className="border-l-2 border-green-400 pl-4 pb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full -ml-6"></div>
                        <span className="font-semibold text-gray-900">Started Taekwondo</span>
                        <span className="text-sm text-gray-500">Beginner Level</span>
                      </div>
                      <p className="text-sm text-gray-600">February 2023</p>
                    </div>
                    <div className="border-l-2 border-purple-400 pl-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-purple-400 rounded-full -ml-6"></div>
                        <span className="font-semibold text-gray-900">Joined Academy</span>
                        <span className="text-sm text-gray-500">Shaolin Kung Fu</span>
                      </div>
                      <p className="text-sm text-gray-600">January 2023</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
