"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  Users,
  Clock,
  Award,
  Edit,
  Building2,
  Star,
  Target,
  GraduationCap,
  Briefcase
} from "lucide-react"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"

interface CoachDetails {
  id: string
  full_name: string
  contact_info: {
    email: string
    phone: string
    address?: {
      street?: string
      city?: string
      state?: string
      postal_code?: string
      country?: string
    }
  }
  areas_of_expertise: string[]
  qualifications?: string[]
  certifications?: string[]
  hire_date?: string
  is_active: boolean
  branch_assignments?: string[]
  bio?: string
  experience_years?: number
  created_at: string
  updated_at: string
  // Performance metrics
  total_students?: number
  active_courses?: number
  student_satisfaction?: number
  retention_rate?: number
}

interface CourseAssignment {
  id: string
  course_name: string
  difficulty_level: string
  enrolled_students: number
  schedule?: string
  branch_name?: string
  status: 'active' | 'completed' | 'upcoming'
}

interface StudentAssignment {
  id: string
  student_name: string
  course_name: string
  enrollment_date: string
  progress: number
  status: 'active' | 'completed' | 'paused'
}

export default function BranchManagerCoachDetailPage() {
  const params = useParams()
  const router = useRouter()
  const coachId = params.id as string

  const [coach, setCoach] = useState<CoachDetails | null>(null)
  const [courseAssignments, setCourseAssignments] = useState<CourseAssignment[]>([])
  const [studentAssignments, setStudentAssignments] = useState<StudentAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication first
    if (!BranchManagerAuth.isAuthenticated()) {
      router.replace('/branch-manager/login')
      return
    }
    fetchCoachDetails()
  }, [coachId, router])

  const fetchCoachDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock coach details data
      const mockCoach: CoachDetails = {
        id: coachId,
        full_name: "John Smith",
        contact_info: {
          email: "john.smith@marshalats.com",
          phone: "+1234567891",
          address: {
            street: "456 Coach Street",
            city: "City Center",
            state: "State",
            postal_code: "12345",
            country: "Country"
          }
        },
        areas_of_expertise: ["Martial Arts", "Self Defense", "Fitness Training"],
        qualifications: ["Bachelor's in Sports Science", "Certified Personal Trainer"],
        certifications: ["Black Belt Karate", "CPR Certified", "First Aid Certified"],
        hire_date: "2023-01-15",
        is_active: true,
        branch_assignments: ["branch_001"],
        bio: "Experienced martial arts instructor with over 10 years of teaching experience. Specializes in traditional martial arts and modern self-defense techniques.",
        experience_years: 10,
        created_at: "2023-01-15T00:00:00Z",
        updated_at: new Date().toISOString(),
        total_students: 45,
        active_courses: 3,
        student_satisfaction: 4.8,
        retention_rate: 92
      }

      const mockCourseAssignments: CourseAssignment[] = [
        {
          id: "assignment_001",
          course_name: "Martial Arts Beginner",
          difficulty_level: "Beginner",
          enrolled_students: 20,
          schedule: "Mon, Wed, Fri - 6:00 PM",
          branch_name: "Main Branch",
          status: 'active'
        },
        {
          id: "assignment_002",
          course_name: "Self Defense Advanced",
          difficulty_level: "Advanced",
          enrolled_students: 15,
          schedule: "Tue, Thu - 7:00 PM",
          branch_name: "Main Branch",
          status: 'active'
        },
        {
          id: "assignment_003",
          course_name: "Fitness Training",
          difficulty_level: "All Levels",
          enrolled_students: 10,
          schedule: "Sat - 9:00 AM",
          branch_name: "Main Branch",
          status: 'active'
        }
      ]

      const mockStudentAssignments: StudentAssignment[] = [
        {
          id: "student_001",
          student_name: "Alice Johnson",
          course_name: "Martial Arts Beginner",
          enrollment_date: "2024-01-15",
          progress: 75,
          status: 'active'
        },
        {
          id: "student_002",
          student_name: "Bob Wilson",
          course_name: "Self Defense Advanced",
          enrollment_date: "2024-02-01",
          progress: 60,
          status: 'active'
        },
        {
          id: "student_003",
          student_name: "Carol Davis",
          course_name: "Fitness Training",
          enrollment_date: "2024-01-20",
          progress: 90,
          status: 'active'
        }
      ]

      setCoach(mockCoach)
      setCourseAssignments(mockCourseAssignments)
      setStudentAssignments(mockStudentAssignments)

    } catch (err: any) {
      console.error("Error fetching coach details:", err)
      setError(err.message || "Failed to fetch coach details")
    } finally {
      setLoading(false)
      setCoursesLoading(false)
      setStudentsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'upcoming': return 'bg-yellow-100 text-yellow-800'
      case 'paused': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader currentPage="Coach Details" />
        <main className="w-full p-4 lg:py-4 px-19">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !coach) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader currentPage="Coach Details" />
        <main className="w-full p-4 lg:py-4 px-19">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-8">
              <p className="text-red-600">{error || "Coach not found"}</p>
              <Button 
                onClick={() => router.push("/branch-manager-dashboard/coaches")}
                className="mt-4"
              >
                Back to Coaches
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader currentPage="Coach Details" />
      
      <main className="w-full p-4 lg:py-4 px-19">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/branch-manager-dashboard/coaches")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Coaches</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{coach.full_name}</h1>
                <p className="text-sm text-gray-500">Coach Details</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => router.push(`/branch-manager-dashboard/coaches/edit/${coachId}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Coach
              </Button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <Badge variant={coach.is_active ? "default" : "secondary"} className="text-sm">
              {coach.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-blue-600">{coach.total_students}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Courses</p>
                    <p className="text-2xl font-bold text-green-600">{coach.active_courses}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                    <p className="text-2xl font-bold text-purple-600">{coach.student_satisfaction}/5</p>
                  </div>
                  <Star className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                    <p className="text-2xl font-bold text-orange-600">{coach.retention_rate}%</p>
                  </div>
                  <Target className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{coach.contact_info.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{coach.contact_info.phone}</p>
                  </div>
                </div>

                {coach.contact_info.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-sm text-gray-600">
                        {coach.contact_info.address.street}<br />
                        {coach.contact_info.address.city}, {coach.contact_info.address.state}<br />
                        {coach.contact_info.address.postal_code}, {coach.contact_info.address.country}
                      </p>
                    </div>
                  </div>
                )}

                {coach.hire_date && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Hire Date</p>
                      <p className="text-sm text-gray-600">{formatDate(coach.hire_date)}</p>
                    </div>
                  </div>
                )}

                {coach.experience_years && (
                  <div className="flex items-center space-x-3">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Experience</p>
                      <p className="text-sm text-gray-600">{coach.experience_years} years</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span>Professional Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 mb-2">Areas of Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {coach.areas_of_expertise.map((expertise, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {expertise}
                      </Badge>
                    ))}
                  </div>
                </div>

                {coach.qualifications && coach.qualifications.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Qualifications</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {coach.qualifications.map((qualification, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <GraduationCap className="w-4 h-4 text-blue-500" />
                          <span>{qualification}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {coach.certifications && coach.certifications.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Certifications</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {coach.certifications.map((certification, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-green-500" />
                          <span>{certification}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {coach.bio && (
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Bio</p>
                    <p className="text-sm text-gray-600">{coach.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Course Assignments and Students */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Course Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span>Course Assignments</span>
                  </div>
                  <Badge variant="secondary">{courseAssignments.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courseAssignments.map((assignment) => (
                    <div key={assignment.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{assignment.course_name}</h4>
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Level: {assignment.difficulty_level}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Students: {assignment.enrolled_students}
                      </p>
                      {assignment.schedule && (
                        <p className="text-sm text-gray-600">
                          Schedule: {assignment.schedule}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Student Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Recent Students</span>
                  </div>
                  <Badge variant="secondary">{studentAssignments.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentAssignments.map((student) => (
                    <div key={student.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{student.student_name}</h4>
                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Course: {student.course_name}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Enrolled: {formatDate(student.enrollment_date)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Progress:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{student.progress}%</span>
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
