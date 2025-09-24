"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import StudentDashboardLayout from "@/components/student-dashboard-layout"
import { CardSkeleton } from "@/components/ui/loading-skeleton"
import { ErrorBoundary } from "@/components/error-boundary"
import {
  BookOpen,
  Clock,
  Users,
  Calendar,
  Award,
  Play,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Star
} from "lucide-react"

export default function StudentCoursesPage() {
  console.log("🎯 StudentCoursesPage component rendered")

  const router = useRouter()
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const loadData = async () => {
    console.log("🔄 loadData function called")
    try {
      setError(null)

      // Check if user is logged in
      const token = localStorage.getItem("token")
      const user = localStorage.getItem("user")

      if (!token) {
        router.push("/login")
        return
      }

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

      setStudentData({
        name: userData.full_name || `${userData.first_name} ${userData.last_name}` || userData.name || "Student",
        email: userData.email || "student@example.com",
      })

      // Fetch student's enrolled courses from the backend API
      const studentId = userData.id
      if (!studentId) {
        throw new Error("Student ID not found in user data")
      }

      console.log("Fetching courses for student:", studentId)

      let response: Response
      let usingFallback = false

      try {
        // Try backend API first
        response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/enrollments/students/${studentId}/courses`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Backend API failed: ${response.status}`)
        }
      } catch (backendError) {
        console.warn("Backend API failed, using frontend mock API:", backendError)
        usingFallback = true

        // Use frontend mock API as fallback
        response = await fetch('/api/student-courses', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            localStorage.clear()
            router.push("/login")
            return
          }
          throw new Error(`Failed to fetch courses from fallback API: ${response.status}`)
        }
      }

      const data = await response.json()
      console.log("Fetched student courses:", data)
      console.log("Raw enrolled_courses array:", data.enrolled_courses)

      if (usingFallback) {
        console.info("📝 Using demo course data - backend enrollment API is currently unavailable")
      }

      // Transform backend data to match frontend expectations
      const enrolledCourses = data.enrolled_courses || []
      console.log("Enrolled courses count:", enrolledCourses.length)
      const transformedCourses = enrolledCourses.map((item: any) => {
        const enrollment = item.enrollment
        const course = item.course

        return {
          id: course.id,
          title: course.title || course.name || "Untitled Course",
          instructor: course.instructor || "TBA",
          level: course.difficulty_level || "Beginner",
          progress: Math.floor(Math.random() * 100), // TODO: Get real progress from backend
          totalLessons: course.total_lessons || 20,
          completedLessons: Math.floor((course.total_lessons || 20) * (Math.random() * 0.8)), // TODO: Get real progress
          nextClass: enrollment.is_active ? "Check schedule" : "Completed",
          location: enrollment.branch_details?.name || "TBA",
          duration: `${course.duration_months || 3} months`,
          status: enrollment.is_active ? "active" : "completed",
          rating: 4.5, // TODO: Get real rating from backend
          description: course.description || "Course description not available",
          image: "/placeholder.svg",
          enrollment_date: enrollment.enrollment_date,
          start_date: enrollment.start_date,
          end_date: enrollment.end_date
        }
      })

      console.log("Transformed courses:", transformedCourses)
      console.log("Setting courses state with:", transformedCourses.length, "courses")

      setCourses(transformedCourses)
      setLoading(false)
    } catch (error) {
      console.error("Error loading courses:", error)
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace')
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
      setLoading(false)

      // Set empty courses array to show empty state
      setCourses([])
    }
  }

  useEffect(() => {
    console.log("useEffect triggered, retryCount:", retryCount)
    loadData()
  }, [retryCount]) // Removed router dependency to avoid infinite loops

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    setLoading(true)
    loadData()
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'intermediate': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <StudentDashboardLayout
        studentName="Loading..."
        onLogout={handleLogout}
        isLoading={true}
        pageTitle="My Courses"
        pageDescription="Track your martial arts training progress"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} showAvatar={true} lines={4} />
          ))}
        </div>
      </StudentDashboardLayout>
    )
  }

  if (error) {
    return (
      <StudentDashboardLayout
        studentName={studentData?.name || "Student"}
        onLogout={handleLogout}
        pageTitle="My Courses"
        pageDescription="Track your martial arts training progress"
      >
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4 border-red-300 text-red-700 hover:bg-red-100"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </StudentDashboardLayout>
    )
  }

  return (
    <ErrorBoundary>
      <StudentDashboardLayout
        studentName={studentData?.name || "Student"}
        onLogout={handleLogout}
        pageTitle="My Courses"
        pageDescription="Track your martial arts training progress"
        breadcrumbItems={[
          { label: "Dashboard", href: "/student-dashboard" },
          { label: "Courses" }
        ]}
      >
        <div className="space-y-6">
          {/* Course Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/60">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Courses</p>
                    <p className="text-3xl font-bold text-blue-900">{courses.length}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/60">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Active Courses</p>
                    <p className="text-3xl font-bold text-green-900">
                      {courses.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                  <Play className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/60">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-purple-900">
                      {courses.filter(c => c.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className={`${getStatusColor(course.status)} border`}>
                      {course.status === 'active' ? 'Active' :
                       course.status === 'completed' ? 'Completed' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge className={`${getLevelColor(course.level)} border`}>
                      {course.level}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Instructor Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{course.instructor}</p>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{course.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{course.completedLessons} of {course.totalLessons} lessons</span>
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{course.nextClass}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{course.location}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full mt-4"
                    variant={course.status === 'completed' ? 'outline' : 'default'}
                  >
                    {course.status === 'completed' ? 'View Certificate' : 'Continue Learning'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Debug Info:</h4>
                <p className="text-sm text-yellow-700">Courses array length: {courses.length}</p>
                <p className="text-sm text-yellow-700">Loading: {loading.toString()}</p>
                <p className="text-sm text-yellow-700">Error: {error || 'None'}</p>
                <p className="text-sm text-yellow-700">Student Data: {studentData ? JSON.stringify(studentData) : 'None'}</p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {courses.length === 0 && !loading && (
            <Card className="text-center py-16">
              <CardContent>
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses enrolled</h3>
                <p className="text-gray-600 mb-6">You haven't enrolled in any courses yet. Start your martial arts journey today!</p>
                <Button onClick={() => router.push('/courses')} className="bg-[#FFC403] hover:bg-[#FFC403]/90 text-white">
                  Browse Courses
                </Button>
                <Button onClick={handleRetry} variant="outline" className="ml-2">
                  Retry Loading
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </StudentDashboardLayout>
    </ErrorBoundary>
  )
}
