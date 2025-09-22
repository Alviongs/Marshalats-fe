"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  BookOpen,
  Building2,
  Edit,
  Calendar,
  DollarSign,
  TrendingUp,
  User
} from "lucide-react"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"

interface BranchDetails {
  id: string
  branch: {
    name: string
    address: {
      street: string
      city: string
      state: string
      postal_code: string
      country: string
    }
    phone: string
    email?: string
    operating_hours?: {
      monday?: string
      tuesday?: string
      wednesday?: string
      thursday?: string
      friday?: string
      saturday?: string
      sunday?: string
    }
  }
  is_active: boolean
  created_at: string
  updated_at: string
  // Additional computed data
  total_students?: number
  total_coaches?: number
  active_courses?: number
  monthly_revenue?: number
}

interface Course {
  id: string
  name: string
  difficulty_level: string
  enrolled_students: number
  instructor_name?: string
}

interface Coach {
  id: string
  full_name: string
  contact_info: {
    email: string
    phone: string
  }
  areas_of_expertise: string[]
  is_active: boolean
}

export default function BranchManagerBranchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const branchId = params.id as string

  const [branch, setBranch] = useState<BranchDetails | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication first
    if (!BranchManagerAuth.isAuthenticated()) {
      router.replace('/branch-manager/login')
      return
    }
    fetchBranchDetails()
  }, [branchId, router])

  const fetchBranchDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const currentUser = BranchManagerAuth.getCurrentUser()
      if (!currentUser) {
        throw new Error("User data not found")
      }

      // Mock branch details data for branch manager
      const mockBranch: BranchDetails = {
        id: branchId,
        branch: {
          name: currentUser.branch_name || "Main Branch",
          address: {
            street: "123 Main Street, Downtown",
            city: "City Center",
            state: "State",
            postal_code: "12345",
            country: "Country"
          },
          phone: "+1234567890",
          email: "mainbranch@marshalats.com",
          operating_hours: {
            monday: "06:00 - 22:00",
            tuesday: "06:00 - 22:00",
            wednesday: "06:00 - 22:00",
            thursday: "06:00 - 22:00",
            friday: "06:00 - 22:00",
            saturday: "07:00 - 20:00",
            sunday: "08:00 - 18:00"
          }
        },
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: new Date().toISOString(),
        total_students: 150,
        total_coaches: 8,
        active_courses: 12,
        monthly_revenue: 125000
      }

      const mockCourses: Course[] = [
        {
          id: "course_001",
          name: "Martial Arts Beginner",
          difficulty_level: "Beginner",
          enrolled_students: 25,
          instructor_name: "John Smith"
        },
        {
          id: "course_002",
          name: "Yoga Intermediate",
          difficulty_level: "Intermediate",
          enrolled_students: 18,
          instructor_name: "Sarah Johnson"
        },
        {
          id: "course_003",
          name: "Dance Advanced",
          difficulty_level: "Advanced",
          enrolled_students: 12,
          instructor_name: "Mike Davis"
        }
      ]

      const mockCoaches: Coach[] = [
        {
          id: "coach_001",
          full_name: "John Smith",
          contact_info: {
            email: "john.smith@marshalats.com",
            phone: "+1234567891"
          },
          areas_of_expertise: ["Martial Arts", "Self Defense"],
          is_active: true
        },
        {
          id: "coach_002",
          full_name: "Sarah Johnson",
          contact_info: {
            email: "sarah.johnson@marshalats.com",
            phone: "+1234567892"
          },
          areas_of_expertise: ["Yoga", "Meditation"],
          is_active: true
        }
      ]

      setBranch(mockBranch)
      setCourses(mockCourses)
      setCoaches(mockCoaches)

    } catch (err: any) {
      console.error("Error fetching branch details:", err)
      setError(err.message || "Failed to fetch branch details")
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader currentPage="Branch Details" />
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

  if (error || !branch) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader currentPage="Branch Details" />
        <main className="w-full p-4 lg:py-4 px-19">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-8">
              <p className="text-red-600">{error || "Branch not found"}</p>
              <Button 
                onClick={() => router.push("/branch-manager-dashboard/branches")}
                className="mt-4"
              >
                Back to Branches
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader currentPage="Branch Details" />
      
      <main className="w-full p-4 lg:py-4 px-19">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/branch-manager-dashboard/branches")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Branches</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{branch.branch.name}</h1>
                <p className="text-sm text-gray-500">Branch Details</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => router.push(`/branch-manager-dashboard/branches/edit/${branchId}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Branch
              </Button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <Badge variant={branch.is_active ? "default" : "secondary"} className="text-sm">
              {branch.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-blue-600">{branch.total_students}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Coaches</p>
                    <p className="text-2xl font-bold text-green-600">{branch.total_coaches}</p>
                  </div>
                  <User className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Courses</p>
                    <p className="text-2xl font-bold text-purple-600">{branch.active_courses}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(branch.monthly_revenue || 0)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Branch Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Branch Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-sm text-gray-600">
                      {branch.branch.address.street}<br />
                      {branch.branch.address.city}, {branch.branch.address.state}<br />
                      {branch.branch.address.postal_code}, {branch.branch.address.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{branch.branch.phone}</p>
                  </div>
                </div>

                {branch.branch.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{branch.branch.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Established</p>
                    <p className="text-sm text-gray-600">{formatDate(branch.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Operating Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {branch.branch.operating_hours ? (
                  <div className="space-y-2">
                    {Object.entries(branch.branch.operating_hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 capitalize">{day}</span>
                        <span className="text-sm text-gray-600">{hours}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Operating hours not specified</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Courses and Coaches */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Active Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span>Active Courses</span>
                  </div>
                  <Badge variant="secondary">{courses.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{course.name}</p>
                        <p className="text-sm text-gray-600">
                          {course.difficulty_level} • {course.enrolled_students} students
                        </p>
                        {course.instructor_name && (
                          <p className="text-xs text-gray-500">Instructor: {course.instructor_name}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/branch-manager-dashboard/courses/${course.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Coaches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Coaches</span>
                  </div>
                  <Badge variant="secondary">{coaches.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coaches.map((coach) => (
                    <div key={coach.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{coach.full_name}</p>
                        <p className="text-sm text-gray-600">{coach.contact_info.email}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {coach.areas_of_expertise.map((expertise, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {expertise}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/branch-manager-dashboard/coaches/${coach.id}`)}
                      >
                        View
                      </Button>
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
