"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Edit, Trash2, RefreshCw, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"

interface Student {
  id: string
  student_id?: string
  full_name: string
  student_name?: string
  email: string
  phone: string
  role: string
  branch_id?: string
  date_of_birth?: string
  is_active: boolean
  created_at?: string
  gender?: string
  age?: number | null
  courses?: Array<{
    course_id: string
    course_name: string
    level?: string
    duration?: string
    branch_name?: string
  }>
  course_info?: {
    category_id: string
    course_id: string
    duration: string
  } | null
  branch_info?: {
    location_id: string
    branch_id: string
  } | null
  address?: {
    line1: string
    area: string
    city: string
    state: string
    pincode: string
    country: string
  }
}

export default function BranchManagerStudentList() {
  const router = useRouter()
  const [showAssignPopup, setShowAssignPopup] = useState(false)
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assignmentLoading, setAssignmentLoading] = useState(false)
  const [assignmentError, setAssignmentError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Authentication check
  useEffect(() => {
    if (!BranchManagerAuth.isAuthenticated()) {
      router.replace('/branch-manager/login')
      return
    }
  }, [router])

  // Load students data for branch manager from API
  useEffect(() => {
    const loadStudentsData = async () => {
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

        // Fetch student details with course enrollment data
        const studentsResponse = await fetch(`http://localhost:8003/api/users/students/details`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!studentsResponse.ok) {
          throw new Error(`Failed to fetch students: ${studentsResponse.status}`)
        }

        const studentsData = await studentsResponse.json()
        const allStudents = studentsData.students || []

        // Filter students by the branch manager's branch (based on their course enrollments)
        const branchStudents = allStudents.filter((student: any) => {
          // Check if student has any enrollments in courses from this branch
          return student.enrollments?.some((enrollment: any) =>
            enrollment.branch_id === branchId
          ) || student.branch_id === branchId
        })

        // Transform the API data to match our Student interface
        const transformedStudents: Student[] = branchStudents.map((student: any) => ({
          id: student.id,
          student_id: student.student_id || student.id,
          full_name: student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          email: student.email || "",
          phone: student.phone || "",
          role: student.role || "student",
          branch_id: branchId,
          date_of_birth: student.date_of_birth,
          is_active: student.is_active ?? true,
          created_at: student.created_at || new Date().toISOString(),
          gender: student.gender,
          age: student.age,
          courses: student.enrollments?.map((enrollment: any) => ({
            course_id: enrollment.course_id,
            course_name: enrollment.course_name || enrollment.course?.name || "Unknown Course",
            level: enrollment.course?.difficulty_level || "Beginner",
            duration: enrollment.course?.duration || "3 months",
            branch_name: branchManager?.branch_assignment?.branch_name || "Branch"
          })) || [],
          address: student.address || {
            line1: "",
            area: "",
            city: "",
            state: "",
            pincode: "",
            country: ""
          }
        }))

        setStudents(transformedStudents)
      } catch (err: any) {
        console.error('Error loading students data:', err)
        setError(err.message || 'Failed to load students data')
      } finally {
        setLoading(false)
      }
    }

    if (BranchManagerAuth.isAuthenticated()) {
      loadStudentsData()
    }
  }, [])

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm) ||
    (student.student_id && student.student_id.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentStudents = filteredStudents.slice(startIndex, endIndex)

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
      const branchManager = profileData.branch_manager
      const branchId = branchManager?.branch_assignment?.branch_id

      if (!branchId) {
        setError("No branch assigned to this manager")
        return
      }

      // Fetch fresh students data
      const studentsResponse = await fetch(`http://localhost:8003/api/users/students/details`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!studentsResponse.ok) {
        throw new Error(`Failed to fetch students: ${studentsResponse.status}`)
      }

      const studentsData = await studentsResponse.json()
      const allStudents = studentsData.students || []

      const branchStudents = allStudents.filter((student: any) => {
        return student.enrollments?.some((enrollment: any) =>
          enrollment.branch_id === branchId
        ) || student.branch_id === branchId
      })

      const transformedStudents: Student[] = branchStudents.map((student: any) => ({
        id: student.id,
        student_id: student.student_id || student.id,
        full_name: student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
        email: student.email || "",
        phone: student.phone || "",
        role: student.role || "student",
        branch_id: branchId,
        date_of_birth: student.date_of_birth,
        is_active: student.is_active ?? true,
        created_at: student.created_at || new Date().toISOString(),
        gender: student.gender,
        age: student.age,
        courses: student.enrollments?.map((enrollment: any) => ({
          course_id: enrollment.course_id,
          course_name: enrollment.course_name || enrollment.course?.name || "Unknown Course",
          level: enrollment.course?.difficulty_level || "Beginner",
          duration: enrollment.course?.duration || "3 months",
          branch_name: branchManager?.branch_assignment?.branch_name || "Branch"
        })) || [],
        address: student.address || {
          line1: "",
          area: "",
          city: "",
          state: "",
          pincode: "",
          country: ""
        }
      }))

      setStudents(transformedStudents)
      setError(null)
    } catch (err: any) {
      console.error('Error refreshing students data:', err)
      setError(err.message || 'Failed to refresh students data')
    } finally {
      setRefreshing(false)
    }
  }

  const handleViewStudent = (studentId: string) => {
    router.push(`/branch-manager-dashboard/students/${studentId}`)
  }

  const handleEditStudent = (studentId: string) => {
    router.push(`/branch-manager-dashboard/students/edit/${studentId}`)
  }

  const handleDeleteStudent = (studentId: string) => {
    setStudentToDelete(studentId)
    setShowDeletePopup(true)
  }

  const confirmDelete = async () => {
    if (studentToDelete) {
      try {
        const authHeaders = BranchManagerAuth.getAuthHeaders()
        if (!authHeaders.Authorization) {
          throw new Error("Authentication token not found. Please login again.")
        }

        const response = await fetch(`http://localhost:8003/api/users/${studentToDelete}`, {
          method: 'DELETE',
          headers: authHeaders
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))

          if (response.status === 401) {
            throw new Error("Invalid authentication credentials. Please login again.")
          } else if (response.status === 403) {
            throw new Error("Insufficient permissions to delete students.")
          } else {
            throw new Error(errorData.detail || errorData.message || `Failed to delete student (${response.status})`)
          }
        }

        // Remove student from local state
        setStudents(students.filter(s => s.id !== studentToDelete))
        setStudentToDelete(null)
        setShowDeletePopup(false)

        // Show success message
        alert('Student deleted successfully')

      } catch (error) {
        console.error("Error deleting student:", error)
        alert(`Error deleting student: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const toggleStudentStatus = (studentId: string) => {
    setStudents(students.map(student =>
      student.id === studentId
        ? { ...student, is_active: !student.is_active }
        : student
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader currentPage="Students" />
      
      <main className="w-full p-4 lg:py-4 px-19">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start py-8 mb-4 lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-medium text-gray-600">Branch Students</h1>
            <p className="text-sm text-gray-500 mt-1">Manage students in your branch</p>
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
              onClick={() => router.push("/branch-manager-dashboard/create-student")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Student
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
                  placeholder="Search students by name, email, phone, or ID..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Students ({filteredStudents.length})
              </h2>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : currentStudents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No students found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {student.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900">{student.full_name}</h3>
                        <p className="text-sm text-gray-500">{student.email}</p>
                        <p className="text-xs text-gray-400">{student.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge variant={student.is_active ? "default" : "secondary"}>
                          {student.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {student.courses && student.courses.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {student.courses[0].course_name}
                          </p>
                        )}
                      </div>
                      
                      <Switch
                        checked={student.is_active}
                        onCheckedChange={() => toggleStudentStatus(student.id)}
                      />
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewStudent(student.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditStudent(student.id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Student
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Student
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
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
              Are you sure you want to delete this student? This action cannot be undone.
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
