"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  CreditCard,
  Clock,
  Award,
  Edit,
  UserCheck,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"

interface StudentDetails {
  id: string
  student_id?: string
  full_name: string
  email: string
  phone: string
  date_of_birth?: string
  gender?: string
  address?: {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  emergency_contact?: {
    name?: string
    phone?: string
    relationship?: string
  }
  is_active: boolean
  role: string
  created_at: string
  updated_at: string
  // Course enrollment data
  courses?: Array<{
    course_id: string
    course_name: string
    level: string
    duration: string
    enrollment_date: string
    completion_date?: string
    progress?: number
    status: 'active' | 'completed' | 'paused' | 'cancelled'
  }>
  // Additional computed data
  total_courses?: number
  completed_courses?: number
  attendance_percentage?: number
  outstanding_balance?: number
}

interface EnrollmentHistory {
  id: string
  course_name: string
  enrollment_date: string
  completion_date?: string
  status: string
  progress: number
  grade?: string
}

interface PaymentRecord {
  id: string
  amount: number
  payment_date: string
  payment_method: string
  status: 'completed' | 'pending' | 'failed'
  description: string
}

interface AttendanceRecord {
  date: string
  course_name: string
  status: 'present' | 'absent' | 'late'
  duration_minutes?: number
}

export default function BranchManagerStudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<StudentDetails | null>(null)
  const [enrollmentHistory, setEnrollmentHistory] = useState<EnrollmentHistory[]>([])
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication first
    if (!BranchManagerAuth.isAuthenticated()) {
      router.replace('/branch-manager/login')
      return
    }
    fetchStudentDetails()
  }, [studentId, router])

  const fetchStudentDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock student details data
      const mockStudent: StudentDetails = {
        id: studentId,
        student_id: "STU001",
        full_name: "Alice Johnson",
        email: "alice.johnson@email.com",
        phone: "+1234567893",
        date_of_birth: "1995-03-20",
        gender: "Female",
        address: {
          street: "789 Student Avenue",
          city: "City Center",
          state: "State",
          postal_code: "12345",
          country: "Country"
        },
        emergency_contact: {
          name: "Robert Johnson",
          phone: "+1234567894",
          relationship: "Father"
        },
        is_active: true,
        role: "student",
        created_at: "2024-01-15T00:00:00Z",
        updated_at: new Date().toISOString(),
        courses: [
          {
            course_id: "course_001",
            course_name: "Martial Arts Beginner",
            level: "Beginner",
            duration: "3 months",
            enrollment_date: "2024-01-15",
            progress: 75,
            status: 'active'
          },
          {
            course_id: "course_002",
            course_name: "Yoga Intermediate",
            level: "Intermediate",
            duration: "6 months",
            enrollment_date: "2024-02-01",
            progress: 45,
            status: 'active'
          }
        ],
        total_courses: 3,
        completed_courses: 1,
        attendance_percentage: 85,
        outstanding_balance: 2500
      }

      const mockEnrollmentHistory: EnrollmentHistory[] = [
        {
          id: "enrollment_001",
          course_name: "Martial Arts Beginner",
          enrollment_date: "2024-01-15",
          status: "active",
          progress: 75,
          grade: "A"
        },
        {
          id: "enrollment_002",
          course_name: "Yoga Intermediate",
          enrollment_date: "2024-02-01",
          status: "active",
          progress: 45
        },
        {
          id: "enrollment_003",
          course_name: "Dance Basics",
          enrollment_date: "2023-10-01",
          completion_date: "2023-12-31",
          status: "completed",
          progress: 100,
          grade: "A+"
        }
      ]

      const mockPaymentRecords: PaymentRecord[] = [
        {
          id: "payment_001",
          amount: 2500,
          payment_date: "2024-01-15",
          payment_method: "Credit Card",
          status: 'completed',
          description: "Martial Arts Beginner - Course Fee"
        },
        {
          id: "payment_002",
          amount: 3000,
          payment_date: "2024-02-01",
          payment_method: "Bank Transfer",
          status: 'completed',
          description: "Yoga Intermediate - Course Fee"
        },
        {
          id: "payment_003",
          amount: 1500,
          payment_date: "2024-03-01",
          payment_method: "UPI",
          status: 'pending',
          description: "Monthly Membership Fee"
        }
      ]

      const mockAttendanceRecords: AttendanceRecord[] = [
        {
          date: "2024-03-15",
          course_name: "Martial Arts Beginner",
          status: 'present',
          duration_minutes: 60
        },
        {
          date: "2024-03-14",
          course_name: "Yoga Intermediate",
          status: 'present',
          duration_minutes: 90
        },
        {
          date: "2024-03-13",
          course_name: "Martial Arts Beginner",
          status: 'late',
          duration_minutes: 45
        },
        {
          date: "2024-03-12",
          course_name: "Yoga Intermediate",
          status: 'absent'
        }
      ]

      setStudent(mockStudent)
      setEnrollmentHistory(mockEnrollmentHistory)
      setPaymentRecords(mockPaymentRecords)
      setAttendanceRecords(mockAttendanceRecords)

    } catch (err: any) {
      console.error("Error fetching student details:", err)
      setError(err.message || "Failed to fetch student details")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
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
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'present': return 'bg-green-100 text-green-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'late': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4" />
      case 'absent': return <XCircle className="w-4 h-4" />
      case 'late': return <AlertCircle className="w-4 h-4" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader currentPage="Student Details" />
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

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader currentPage="Student Details" />
        <main className="w-full p-4 lg:py-4 px-19">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-8">
              <p className="text-red-600">{error || "Student not found"}</p>
              <Button 
                onClick={() => router.push("/branch-manager-dashboard/students")}
                className="mt-4"
              >
                Back to Students
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader currentPage="Student Details" />
      
      <main className="w-full p-4 lg:py-4 px-19">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/branch-manager-dashboard/students")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Students</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{student.full_name}</h1>
                <p className="text-sm text-gray-500">Student ID: {student.student_id}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => router.push(`/branch-manager-dashboard/students/edit/${studentId}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Student
              </Button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <Badge variant={student.is_active ? "default" : "secondary"} className="text-sm">
              {student.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Courses</p>
                    <p className="text-2xl font-bold text-blue-600">{student.total_courses}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{student.completed_courses}</p>
                  </div>
                  <Award className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Attendance</p>
                    <p className="text-2xl font-bold text-purple-600">{student.attendance_percentage}%</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Outstanding</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(student.outstanding_balance || 0)}
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-orange-500" />
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
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{student.phone}</p>
                  </div>
                </div>

                {student.date_of_birth && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Date of Birth</p>
                      <p className="text-sm text-gray-600">{formatDate(student.date_of_birth)}</p>
                    </div>
                  </div>
                )}

                {student.gender && (
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Gender</p>
                      <p className="text-sm text-gray-600">{student.gender}</p>
                    </div>
                  </div>
                )}

                {student.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-sm text-gray-600">
                        {student.address.street}<br />
                        {student.address.city}, {student.address.state}<br />
                        {student.address.postal_code}, {student.address.country}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Joined</p>
                    <p className="text-sm text-gray-600">{formatDate(student.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span>Emergency Contact</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {student.emergency_contact ? (
                  <>
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Name</p>
                        <p className="text-sm text-gray-600">{student.emergency_contact.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Phone</p>
                        <p className="text-sm text-gray-600">{student.emergency_contact.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Relationship</p>
                        <p className="text-sm text-gray-600">{student.emergency_contact.relationship}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No emergency contact information available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current Courses */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>Current Courses</span>
                </div>
                <Badge variant="secondary">{student.courses?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.courses && student.courses.length > 0 ? (
                  student.courses.map((course) => (
                    <div key={course.course_id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{course.course_name}</h4>
                          <p className="text-sm text-gray-600">
                            {course.level} • {course.duration} • Enrolled: {formatDate(course.enrollment_date)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                      </div>
                      
                      {course.progress !== undefined && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium text-gray-900">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No current course enrollments</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>Recent Payments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentRecords.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-600">{payment.description}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(payment.payment_date)} • {payment.payment_method}
                        </p>
                      </div>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Attendance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Recent Attendance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendanceRecords.slice(0, 5).map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{record.course_name}</p>
                        <p className="text-sm text-gray-600">{formatDate(record.date)}</p>
                        {record.duration_minutes && (
                          <p className="text-xs text-gray-500">{record.duration_minutes} minutes</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(record.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(record.status)}
                            <span>{record.status}</span>
                          </div>
                        </Badge>
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
