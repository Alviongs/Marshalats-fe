"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import StudentDashboardLayout from "@/components/student-dashboard-layout"
import { CardSkeleton, LoadingSkeleton } from "@/components/ui/loading-skeleton"
import {
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Users,
  BookOpen,
  CreditCard,
  Bell,
  ArrowRight,
  Target,
  Zap,
  Star
} from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [quickActions, setQuickActions] = useState<any[]>([])

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (!token) {
      router.push("/login")
      return
    }

    // Simulate loading comprehensive student data
    const loadData = async () => {
      try {
        let userData: any = {}

        if (user) {
          userData = JSON.parse(user)

          // Check if user is actually a student
          if (userData.role !== "student") {
            if (userData.role === "coach") {
              router.push("/coach-dashboard")
            } else {
              router.push("/dashboard")
            }
            return
          }
        }

        // Set comprehensive student data
        setStudentData({
          name: userData.full_name || `${userData.first_name} ${userData.last_name}` || userData.name || "John Doe",
          email: userData.email || "john.doe@example.com",
          studentId: "STU-2024-001",
          joinDate: "2024-01-15",
          belt: "Blue Belt",
          nextBelt: "Purple Belt",
          profileImage: "/placeholder.svg",
          course: userData.course?.course_id || "Karate"
        })

        // Set dashboard statistics
        setDashboardStats({
          enrolledCourses: 3,
          completedClasses: 24,
          upcomingClasses: 5,
          overallProgress: 75,
          attendanceRate: 92,
          totalHours: 48,
          achievements: 8,
          rank: 12,
          streakDays: 15,
          nextClassTime: "Today, 6:00 PM"
        })

        // Set recent activity
        setRecentActivity([
          { id: 1, type: "class", title: "Karate Basics", date: "2024-01-20", status: "completed", icon: BookOpen },
          { id: 2, type: "achievement", title: "Perfect Attendance", date: "2024-01-19", status: "earned", icon: Award },
          { id: 3, type: "payment", title: "Monthly Fee", date: "2024-01-18", status: "paid", icon: CreditCard },
          { id: 4, type: "class", title: "Advanced Techniques", date: "2024-01-17", status: "completed", icon: Target }
        ])

        // Set upcoming events
        setUpcomingEvents([
          { id: 1, title: "Karate Basics", date: "2024-01-22", time: "10:00 AM", instructor: "Sensei Mike", type: "class" },
          { id: 2, title: "Sparring Session", date: "2024-01-23", time: "2:00 PM", instructor: "Sensei Sarah", type: "practice" },
          { id: 3, title: "Belt Testing", date: "2024-01-25", time: "11:00 AM", instructor: "Master Chen", type: "exam" }
        ])

        // Set quick actions
        setQuickActions([
          { id: 1, title: "View Courses", description: "See all enrolled courses", icon: BookOpen, href: "/student-dashboard/courses", color: "blue" },
          { id: 2, title: "Check Attendance", description: "View attendance record", icon: Calendar, href: "/student-dashboard/attendance", color: "green" },
          { id: 3, title: "Track Progress", description: "Monitor your development", icon: TrendingUp, href: "/student-dashboard/progress", color: "purple" },
          { id: 4, title: "Make Payment", description: "Pay fees and dues", icon: CreditCard, href: "/student-dashboard/payments", color: "orange" }
        ])

        setLoading(false)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'class': return BookOpen
      case 'achievement': return Award
      case 'payment': return CreditCard
      default: return Target
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'earned': return 'text-yellow-600 bg-yellow-50'
      case 'paid': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <StudentDashboardLayout
        studentName="Loading..."
        onLogout={handleLogout}
        isLoading={true}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton lines={5} />
            <CardSkeleton lines={5} />
          </div>
        </div>
      </StudentDashboardLayout>
    )
  }

  return (
    <StudentDashboardLayout
      studentName={studentData?.name || "Student"}
      onLogout={handleLogout}
      pageTitle="Dashboard"
      pageDescription={`Welcome back, ${studentData?.name || "Student"}! Here's your training overview.`}
    >
      <div className="space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Enrolled Courses */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/60 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Enrolled Courses</p>
                  <p className="text-3xl font-bold text-blue-900">{dashboardStats?.enrolledCourses || 0}</p>
                </div>
                <div className="p-3 bg-blue-200/50 rounded-xl">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-blue-700">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Active learning</span>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Rate */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/60 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Attendance Rate</p>
                  <p className="text-3xl font-bold text-green-900">{dashboardStats?.attendanceRate || 0}%</p>
                </div>
                <div className="p-3 bg-green-200/50 rounded-xl">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-700">
                <Star className="w-4 h-4 mr-1" />
                <span>Excellent!</span>
              </div>
            </CardContent>
          </Card>

          {/* Training Hours */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/60 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Training Hours</p>
                  <p className="text-3xl font-bold text-purple-900">{dashboardStats?.totalHours || 0}</p>
                </div>
                <div className="p-3 bg-purple-200/50 rounded-xl">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-purple-700">
                <Zap className="w-4 h-4 mr-1" />
                <span>This month</span>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200/60 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 mb-1">Achievements</p>
                  <p className="text-3xl font-bold text-yellow-900">{dashboardStats?.achievements || 0}</p>
                </div>
                <div className="p-3 bg-yellow-200/50 rounded-xl">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-yellow-700">
                <Target className="w-4 h-4 mr-1" />
                <span>Unlocked</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Progress & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100">
                <CardTitle className="flex items-center space-x-2 mt-4">
                 
                  <span>Training Progress</span>
                </CardTitle>
                <CardDescription>Your martial arts journey to {studentData?.nextBelt}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Current Belt: {studentData?.belt}</p>
                        <p className="text-sm text-gray-600">Next: {studentData?.nextBelt}</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1">
                      {dashboardStats?.overallProgress}% Complete
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Overall Progress</span>
                      <span className="text-gray-600">{dashboardStats?.overallProgress}%</span>
                    </div>
                    <Progress value={dashboardStats?.overallProgress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{dashboardStats?.streakDays}</p>
                      <p className="text-sm text-gray-600">Day Streak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{dashboardStats?.rank}</p>
                      <p className="text-sm text-gray-600">Class Rank</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    const colorClasses = {
                      blue: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200",
                      green: "bg-green-50 text-green-600 hover:bg-green-100 border-green-200",
                      purple: "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200",
                      orange: "bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200"
                    }

                    return (
                      <Button
                        key={action.id}
                        variant="outline"
                        className={`h-auto p-4 justify-start space-x-3 ${colorClasses[action.color as keyof typeof colorClasses]} transition-all duration-200 hover:shadow-md`}
                        onClick={() => router.push(action.href)}
                      >
                        <Icon className="w-5 h-5" />
                        <div className="text-left">
                          <p className="font-medium">{action.title}</p>
                          <p className="text-xs opacity-80">{action.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Upcoming Events & Recent Activity */}
          <div className="space-y-6">
            {/* Next Class */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  
                  <span>Next Class</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="p-4 bg-white/60 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{dashboardStats?.nextClassTime}</p>
                    <p className="text-sm text-green-600 mt-1">Karate Basics</p>
                  </div>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => router.push('/student-dashboard/courses')}
                  >
                    View Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                 
                  <span>Upcoming Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {upcomingEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                        index !== upcomingEvents.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          event.type === 'exam' ? 'bg-red-100 text-red-600' :
                          event.type === 'practice' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {event.type === 'exam' ? <Award className="w-4 h-4" /> :
                           event.type === 'practice' ? <Target className="w-4 h-4" /> :
                           <BookOpen className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{event.title}</p>
                          <p className="text-sm text-gray-600">{event.instructor}</p>
                          <p className="text-xs text-gray-500 mt-1">{event.date} at {event.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/student-dashboard/courses')}
                  >
                    View All Events
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {recentActivity.map((activity, index) => {
                    const Icon = getActivityIcon(activity.type)
                    const colorClass = getActivityColor(activity.status)

                    return (
                      <div
                        key={activity.id}
                        className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                          index !== recentActivity.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${colorClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{activity.title}</p>
                            <p className="text-sm text-gray-600 capitalize">{activity.status}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="p-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/student-dashboard/progress')}
                  >
                    View All Activity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  )
}
