"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function StudentDashboard() {
  const router = useRouter()
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    
    console.log("Student dashboard - Token:", token ? "Present" : "Missing"); // Debug log
    console.log("Student dashboard - User data:", user ? "Present" : "Missing"); // Debug log
    
    if (!token) {
      console.log("No token found, redirecting to login"); // Debug log
      router.push("/login")
      return
    }

    // Try to get user data from localStorage
    if (user) {
      try {
        const userData = JSON.parse(user)
        console.log("Parsed user data:", userData); // Debug log
        
        // Check if user is actually a student
        if (userData.role !== "student") {
          console.log("User is not a student, redirecting to appropriate dashboard"); // Debug log
          if (userData.role === "coach") {
            router.push("/coach-dashboard")
          } else {
            router.push("/dashboard") // Redirect non-students to admin dashboard
          }
          return
        }
        
        setStudentData({
          name: userData.full_name || `${userData.first_name} ${userData.last_name}` || userData.name || "Student",
          email: userData.email || "student@example.com",
          course: userData.course?.course_id || "Martial Arts",
          level: "Beginner", // You can derive this from course data
          nextClass: "Today, 6:00 PM", // This would come from class schedule API
          attendance: "85%", // This would come from attendance API
          progress: 65 // This would come from progress tracking API
        })
      } catch (error) {
        console.error("Error parsing user data:", error)
        // Fallback to default data
        setStudentData({
          name: "Student",
          email: "student@example.com",
          course: "Martial Arts",
          level: "Beginner",
          nextClass: "Today, 6:00 PM",
          attendance: "85%",
          progress: 65
        })
      }
    } else {
      // Fallback data if no user info available
      setStudentData({
        name: "Student",
        email: "student@example.com",
        course: "Martial Arts",
        level: "Beginner",
        nextClass: "Today, 6:00 PM",
        attendance: "85%",
        progress: 65
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {studentData?.name}</span>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {studentData?.name}</p>
                  <p><strong>Email:</strong> {studentData?.email}</p>
                  <p><strong>Course:</strong> 
                    <Badge className="ml-2 bg-yellow-100 text-yellow-800">{studentData?.course}</Badge>
                  </p>
                  <p><strong>Level:</strong> 
                    <Badge variant="outline" className="ml-2">{studentData?.level}</Badge>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Next Class Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Next Class</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{studentData?.nextClass}</p>
                  <p className="text-sm text-gray-500 mt-2">Don't miss your training session!</p>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Attendance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{studentData?.attendance}</p>
                  <p className="text-sm text-gray-500 mt-2">Keep up the great work!</p>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Training Progress</span>
                </CardTitle>
                <CardDescription>Your martial arts journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{studentData?.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${studentData?.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    You're making excellent progress! Keep training regularly to reach your next belt level.
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  )
}
