"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2, RefreshCw, Eye, BookOpen, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"

interface Course {
  id: string
  course_name: string
  category: string
  level: string
  duration: string
  price: number
  is_active: boolean
  description: string
  enrolled_students: number
  assigned_coaches: Array<{
    coach_id: string
    coach_name: string
  }>
  created_at: string
  updated_at: string
}

export default function BranchManagerCoursesList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Authentication check
  useEffect(() => {
    if (!BranchManagerAuth.isAuthenticated()) {
      router.replace('/branch-manager/login')
      return
    }
  }, [router])

  // Load courses data for branch manager from API
  useEffect(() => {
    const loadCoursesData = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = BranchManagerAuth.getToken()
        if (!token) {
          setError("Authentication token not found. Please login again.")
          return
        }

        // First, get the current branch manager's profile to get their managed branches
        const profileResponse = await fetch(`http://localhost:8003/api/branch-managers/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch branch manager profile: ${profileResponse.status}`)
        }

        const profileData = await profileResponse.json()
        const branchManager = profileData.branch_manager

        // Get the branch ID from the branch manager's assignment
        const branchId = branchManager?.branch_assignment?.branch_id

        if (!branchId) {
          setError("No branch assigned to this manager")
          return
        }

        // Fetch courses for the specific branch
        const coursesResponse = await fetch(`http://localhost:8003/api/courses/by-branch/${branchId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!coursesResponse.ok) {
          throw new Error(`Failed to fetch courses: ${coursesResponse.status}`)
        }

        const coursesData = await coursesResponse.json()
        const branchCourses = coursesData.courses || []

        // Transform the API data to match our Course interface
        const transformedCourses: Course[] = branchCourses.map((course: any) => ({
          id: course.id,
          course_name: course.name || course.course_name || course.title,
          category: course.category_name || course.category || "General",
          level: course.difficulty_level || course.level || "Beginner",
          duration: course.duration || "3 months",
          price: course.pricing?.amount || course.price || 0,
          is_active: course.settings?.active ?? course.is_active ?? true,
          description: course.description || "",
          enrolled_students: course.student_count || course.enrolled_students || 0,
          assigned_coaches: course.instructors?.map((instructor: any) => ({
            coach_id: instructor.id || instructor.coach_id,
            coach_name: instructor.full_name || instructor.coach_name || instructor.name
          })) || [],
          created_at: course.created_at || new Date().toISOString(),
          updated_at: course.updated_at || new Date().toISOString()
        }))

        setCourses(transformedCourses)
      } catch (err: any) {
        console.error('Error loading courses data:', err)
        setError(err.message || 'Failed to load courses data')
      } finally {
        setLoading(false)
      }
    }

    if (BranchManagerAuth.isAuthenticated()) {
      loadCoursesData()
    }
  }, [])

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCourses = filteredCourses.slice(startIndex, endIndex)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const token = BranchManagerAuth.getToken()
      if (!token) {
        setError("Authentication token not found. Please login again.")
        return
      }

      // Get branch manager profile
      const profileResponse = await fetch(`http://localhost:8003/api/branch-managers/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!profileResponse.ok) {
        throw new Error(`Failed to fetch branch manager profile: ${profileResponse.status}`)
      }

      const profileData = await profileResponse.json()
      const branchId = profileData.branch_manager?.branch_assignment?.branch_id

      if (!branchId) {
        setError("No branch assigned to this manager")
        return
      }

      // Fetch fresh courses data
      const coursesResponse = await fetch(`http://localhost:8003/api/courses/by-branch/${branchId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!coursesResponse.ok) {
        throw new Error(`Failed to fetch courses: ${coursesResponse.status}`)
      }

      const coursesData = await coursesResponse.json()
      const branchCourses = coursesData.courses || []

      const transformedCourses: Course[] = branchCourses.map((course: any) => ({
        id: course.id,
        course_name: course.name || course.course_name || course.title,
        category: course.category_name || course.category || "General",
        level: course.difficulty_level || course.level || "Beginner",
        duration: course.duration || "3 months",
        price: course.pricing?.amount || course.price || 0,
        is_active: course.settings?.active ?? course.is_active ?? true,
        description: course.description || "",
        enrolled_students: course.student_count || course.enrolled_students || 0,
        assigned_coaches: course.instructors?.map((instructor: any) => ({
          coach_id: instructor.id || instructor.coach_id,
          coach_name: instructor.full_name || instructor.coach_name || instructor.name
        })) || [],
        created_at: course.created_at || new Date().toISOString(),
        updated_at: course.updated_at || new Date().toISOString()
      }))

      setCourses(transformedCourses)
      setError(null)
    } catch (err: any) {
      console.error('Error refreshing courses data:', err)
      setError(err.message || 'Failed to refresh courses data')
    } finally {
      setRefreshing(false)
    }
  }

  const handleViewCourse = (courseId: string) => {
    router.push(`/branch-manager-dashboard/courses/${courseId}`)
  }

  const handleEditCourse = (courseId: string) => {
    router.push(`/branch-manager-dashboard/courses/edit/${courseId}`)
  }

  const handleDeleteCourse = (courseId: string) => {
    setCourseToDelete(courseId)
    setShowDeletePopup(true)
  }

  const confirmDelete = () => {
    if (courseToDelete) {
      setCourses(courses.filter(c => c.id !== courseToDelete))
      setCourseToDelete(null)
      setShowDeletePopup(false)
    }
  }

  const toggleCourseStatus = (courseId: string) => {
    setCourses(courses.map(course =>
      course.id === courseId
        ? { ...course, is_active: !course.is_active }
        : course
    ))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader currentPage="Courses" />
      
      <main className="w-full p-4 lg:py-4 px-19">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start py-8 mb-4 lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-medium text-gray-600">Branch Courses</h1>
            <p className="text-sm text-gray-500 mt-1">Manage courses offered in your branch</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => router.push("/branch-manager-dashboard/create-course")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Course
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search courses by name, category, level, or description..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Courses ({filteredCourses.length})
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : currentCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No courses found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentCourses.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{course.course_name}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">{course.category}</Badge>
                          <Badge variant="secondary">{course.level}</Badge>
                          <Badge variant={course.is_active ? "default" : "secondary"}>
                            {course.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewCourse(course.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCourse(course.id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Course
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Course
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium">{course.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-medium text-green-600">{formatCurrency(course.price)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Students:</span>
                        <span className="font-medium flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {course.enrolled_students}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {course.assigned_coaches.length} coach(es)
                      </div>
                      <Switch
                        checked={course.is_active}
                        onCheckedChange={() => toggleCourseStatus(course.id)}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredCourses.length)} of {filteredCourses.length} courses
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this course? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeletePopup(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
