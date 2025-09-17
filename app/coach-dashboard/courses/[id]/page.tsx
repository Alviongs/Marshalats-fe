"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Clock, 
  Award, 
  MapPin,
  Loader2,
  Calendar,
  TrendingUp,
  Mail,
  Phone
} from "lucide-react"
import CoachDashboardHeader from "@/components/coach-dashboard-header"
import { checkCoachAuth } from "@/lib/coachAuth"

interface CourseDetails {
  id: string
  course_name: string
  course_code?: string
  description?: string
  difficulty_level?: string
  status: string
  assigned_date: string
  total_students?: number
  active_students?: number
  branch_name?: string
  category?: string
  syllabus?: string
  equipment_required?: string[]
  pricing?: {
    currency: string
    amount: number
  }
}

interface EnrolledStudent {
  id: string
  full_name?: string
  student_name?: string  // Backend returns this field
  email: string
  phone?: string
  enrollment_date: string
  status: string
  progress?: number
  attendance_percentage?: number
}

export default function CourseDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<CourseDetails | null>(null)
  const [students, setStudents] = useState<EnrolledStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coachData, setCoachData] = useState<any>(null)

  useEffect(() => {
    // Use the robust coach authentication check
    const authResult = checkCoachAuth()

    if (!authResult.isAuthenticated) {
      console.log("Coach not authenticated:", authResult.error)
      router.push("/coach/login")
      return
    }

    if (authResult.coach && authResult.token) {
      setCoachData(authResult.coach)
      fetchCourseDetails(authResult.token, authResult.coach.id)
    } else {
      setError("Coach information not found")
      setLoading(false)
    }
  }, [router, courseId])

  const fetchCourseDetails = async (token: string, coachId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch course details from coach courses endpoint
      const coursesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coaches/${coachId}/courses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!coursesResponse.ok) {
        if (coursesResponse.status === 401) {
          localStorage.clear()
          router.push("/coach/login")
          return
        }
        throw new Error(`Failed to fetch course details: ${coursesResponse.status}`)
      }

      const coursesData = await coursesResponse.json()
      const courses = coursesData.courses || coursesData.course_assignments || []
      const courseDetail = courses.find((c: any) => c.id === courseId)
      
      if (!courseDetail) {
        setError("Course not found or not assigned to you")
        setLoading(false)
        return
      }

      setCourse(courseDetail)

      // Fetch students for this course
      const studentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coaches/${coachId}/students`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        const allStudents = studentsData.students || studentsData.enrolled_students || []
        // Filter students for this specific course
        const courseStudents = allStudents.filter((s: any) => s.course_id === courseId)
        setStudents(courseStudents)
      }

    } catch (err: any) {
      console.error('Error fetching course details:', err)
      setError(err.message || 'Failed to load course details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Course Details"
          coachName={coachData?.full_name || coachData?.name}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
              <span className="ml-2 text-gray-600">Loading course details...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Course Details"
          coachName={coachData?.full_name || coachData?.name}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-red-600 font-medium mb-2">Error loading course</p>
                  <p className="text-sm text-gray-600 mb-4">{error}</p>
                  <Button 
                    onClick={() => router.push("/coach-dashboard/courses")}
                    variant="outline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Courses
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachDashboardHeader 
        currentPage="Course Details"
        coachName={coachData?.full_name || coachData?.name}
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Back Button */}
          <Button 
            onClick={() => router.push("/coach-dashboard/courses")}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>

          {/* Course Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <BookOpen className="w-6 h-6 text-yellow-600" />
                    <h1 className="text-2xl font-bold text-gray-900">{course.course_name}</h1>
                  </div>
                  
                  {course.course_code && (
                    <p className="text-gray-500 mb-2">Course Code: {course.course_code}</p>
                  )}
                  
                  {course.description && (
                    <p className="text-gray-600 mb-4">{course.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Badge className={getStatusColor(course.status)}>
                      {course.status}
                    </Badge>
                    
                    {course.difficulty_level && (
                      <Badge variant="outline" className={getDifficultyColor(course.difficulty_level)}>
                        {course.difficulty_level}
                      </Badge>
                    )}
                    
                    {course.category && (
                      <Badge variant="outline">
                        {course.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {course.active_students || course.total_students || 0}
                    </p>
                    <p className="text-sm text-gray-500">Active Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {course.assigned_date ? new Date(course.assigned_date).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">Assigned Date</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-lg font-bold text-purple-600">
                      {course.branch_name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">Branch</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {course.pricing ? `${course.pricing.currency} ${course.pricing.amount}` : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">Course Fee</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Details Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Course Name</label>
                        <p className="text-gray-900">{course.course_name}</p>
                      </div>
                      
                      {course.course_code && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Course Code</label>
                          <p className="text-gray-900">{course.course_code}</p>
                        </div>
                      )}
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Difficulty Level</label>
                        <p className="text-gray-900">{course.difficulty_level || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Category</label>
                        <p className="text-gray-900">{course.category || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <Badge className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {course.equipment_required && course.equipment_required.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Equipment Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {course.equipment_required.map((equipment, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="text-gray-900">{equipment}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Students</CardTitle>
                </CardHeader>
                <CardContent>
                  {students.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h3>
                      <p className="text-gray-500">No students are currently enrolled in this course.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Contact</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Enrolled</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student) => (
                            <tr key={student.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src="" alt={student.student_name || student.full_name || 'Student'} />
                                    <AvatarFallback className="bg-yellow-100 text-yellow-800 text-xs">
                                      {(() => {
                                        const name = student.student_name || student.full_name
                                        return name
                                          ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                                          : 'S'
                                      })()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-gray-900">{student.student_name || student.full_name || 'Unknown Student'}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1">
                                    <Mail className="w-3 h-3 text-gray-400" />
                                    <span className="text-sm text-gray-600">{student.email}</span>
                                  </div>
                                  {student.phone && (
                                    <div className="flex items-center space-x-1">
                                      <Phone className="w-3 h-3 text-gray-400" />
                                      <span className="text-sm text-gray-600">{student.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600">
                                  {new Date(student.enrollment_date).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={getStatusColor(student.status)}>
                                  {student.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum">
              <Card>
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                </CardHeader>
                <CardContent>
                  {course.syllabus ? (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{course.syllabus}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Curriculum Available</h3>
                      <p className="text-gray-500">Course curriculum information is not available yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
