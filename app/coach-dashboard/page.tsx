"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function CoachDashboard() {
  const router = useRouter()
  const [coachData, setCoachData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in - look for access_token (used by coach login)
    const token = localStorage.getItem("access_token") || localStorage.getItem("token")
    const coachData = localStorage.getItem("coach")
    const user = localStorage.getItem("user")
    const tokenExpiration = localStorage.getItem("token_expiration")
    
    console.log("Coach dashboard - Access Token:", token ? "Present" : "Missing"); // Debug log
    console.log("Coach dashboard - Coach data:", coachData ? "Present" : "Missing"); // Debug log
    console.log("Coach dashboard - User data:", user ? "Present" : "Missing"); // Debug log
    console.log("Coach dashboard - Token expiration:", tokenExpiration); // Debug log
    
    if (!token) {
      console.log("No token found, redirecting to coach login"); // Debug log
      router.push("/coach/login")
      return
    }

    // Check token expiration
    if (tokenExpiration) {
      const expirationTime = parseInt(tokenExpiration)
      if (Date.now() >= expirationTime) {
        console.log("Token expired, clearing session and redirecting"); // Debug log
        localStorage.removeItem("access_token")
        localStorage.removeItem("token_type")
        localStorage.removeItem("expires_in")
        localStorage.removeItem("token_expiration")
        localStorage.removeItem("coach")
        localStorage.removeItem("user")
        router.push("/coach/login")
        return
      }
    }

    // Try to get coach and user data from localStorage
    if (coachData || user) {
      try {
        // Prefer coach data over user data
        const userData = coachData ? JSON.parse(coachData) : (user ? JSON.parse(user) : null)
        console.log("Parsed coach/user data:", userData); // Debug log
        
        if (!userData) {
          console.log("No valid user data found"); // Debug log
          setCoachData({
            name: "Coach",
            email: "coach@example.com",
            specialization: "Martial Arts",
            experience: "5 years",
            totalStudents: 25,
            todayClasses: 3,
            thisWeekClasses: 12,
            avgAttendance: "78%",
            upcomingClass: "Karate - Advanced (2:00 PM)",
            recentAchievements: [
              "Student John Doe achieved Yellow Belt",
              "Class attendance improved by 15%",
              "New beginner batch started"
            ]
          })
          setLoading(false)
          return
        }
        
        // Check if user is actually a coach
        if (userData.role !== "coach") {
          console.log("User is not a coach, redirecting to appropriate dashboard"); // Debug log
          if (userData.role === "student") {
            router.push("/student-dashboard")
          } else if (userData.role === "superadmin") {
            router.push("/dashboard")
          } else {
            router.push("/login")
          }
          return
        }
        
        setCoachData({
          name: userData.full_name || `${userData.first_name} ${userData.last_name}` || userData.name || "Coach",
          email: userData.email || "coach@example.com",
          specialization: userData.professional_info?.specialization || userData.specialization || "Martial Arts",
          experience: userData.professional_info?.years_of_experience || userData.experience || "5 years",
          totalStudents: 25, // This would come from students API
          todayClasses: 3, // This would come from schedule API
          thisWeekClasses: 12, // This would come from schedule API
          avgAttendance: "78%", // This would come from attendance API
          upcomingClass: "Karate - Advanced (2:00 PM)",
          recentAchievements: [
            "Student John Doe achieved Yellow Belt",
            "Class attendance improved by 15%",
            "New beginner batch started"
          ]
        })
      } catch (error) {
        console.error("Error parsing user data:", error)
        // Fallback to default data
        setCoachData({
          name: "Coach",
          email: "coach@example.com",
          specialization: "Martial Arts",
          experience: "5 years",
          totalStudents: 25,
          todayClasses: 3,
          thisWeekClasses: 12,
          avgAttendance: "78%",
          upcomingClass: "Karate - Advanced (2:00 PM)",
          recentAchievements: [
            "Student John Doe achieved Yellow Belt",
            "Class attendance improved by 15%",
            "New beginner batch started"
          ]
        })
      }
    } else {
      // Fallback data if no user info available
      setCoachData({
        name: "Coach",
        email: "coach@example.com",
        specialization: "Martial Arts",
        experience: "5 years",
        totalStudents: 25,
        todayClasses: 3,
        thisWeekClasses: 12,
        avgAttendance: "78%",
        upcomingClass: "Karate - Advanced (2:00 PM)",
        recentAchievements: [
          "Student John Doe achieved Yellow Belt",
          "Class attendance improved by 15%",
          "New beginner batch started"
        ]
      })
    }
    
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    // Clear all authentication data including coach-specific tokens
    localStorage.removeItem("access_token")
    localStorage.removeItem("token_type")
    localStorage.removeItem("expires_in")
    localStorage.removeItem("token_expiration")
    localStorage.removeItem("coach")
    localStorage.removeItem("user")
    // Also clear legacy token if exists
    localStorage.removeItem("token")
    
    console.log("Coach logged out, redirecting to coach login"); // Debug log
    router.push("/coach/login")
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
              <h1 className="text-2xl font-bold text-gray-900">Coach Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {coachData?.name}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            
            {/* Total Students Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{coachData?.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Active students under your guidance</p>
              </CardContent>
            </Card>

            {/* Today's Classes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{coachData?.todayClasses}</div>
                <p className="text-xs text-muted-foreground">Classes scheduled for today</p>
              </CardContent>
            </Card>

            {/* This Week's Classes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{coachData?.thisWeekClasses}</div>
                <p className="text-xs text-muted-foreground">Total classes this week</p>
              </CardContent>
            </Card>

            {/* Average Attendance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{coachData?.avgAttendance}</div>
                <p className="text-xs text-muted-foreground">Average class attendance</p>
              </CardContent>
            </Card>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Coach Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder-user.jpg" alt="Coach" />
                      <AvatarFallback className="text-lg font-semibold bg-yellow-100 text-yellow-800">
                        {coachData?.name?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{coachData?.name}</h3>
                      <p className="text-sm text-gray-500">{coachData?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Specialization:</strong> 
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800">{coachData?.specialization}</Badge>
                    </p>
                    <p><strong>Experience:</strong> 
                      <Badge variant="outline" className="ml-2">{coachData?.experience}</Badge>
                    </p>
                  </div>
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
                  <p className="text-lg font-semibold text-green-600 mb-2">{coachData?.upcomingClass}</p>
                  <p className="text-sm text-gray-500">Make sure to prepare class materials</p>
                  <Button className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                    View Class Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Mark Attendance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    View Students
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Class Schedule
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Progress Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>Recent Achievements</span>
                </CardTitle>
                <CardDescription>Latest milestones and accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coachData?.recentAchievements?.map((achievement: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{achievement}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {index === 0 ? "Today" : index === 1 ? "Yesterday" : "This week"}
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
