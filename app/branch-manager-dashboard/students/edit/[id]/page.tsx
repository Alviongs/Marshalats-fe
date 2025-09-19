"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, MapPin, Phone, BookOpen, X, Loader2, AlertCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"
import { useToast } from "@/hooks/use-toast"

export default function BranchManagerEditStudentPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const { toast } = useToast()

  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "", // Optional password field for updates
    gender: "",
    dateOfBirth: "",
    studentId: "",

    // Address Information
    address: "",
    area: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",

    // Professional Information (if applicable)
    occupation: "",
    company: "",
    workAddress: "",

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",

    // Course Assignments
    branch: "",
    courses: [] as string[],

    // Additional Information
    medicalConditions: "",
    notes: "",
    joinDate: "",
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Dynamic data states
  const [branches, setBranches] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])

  // Loading states for dynamic data
  const [isLoadingBranches, setIsLoadingBranches] = useState(true)
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)

  useEffect(() => {
    // Check authentication first
    if (!BranchManagerAuth.isAuthenticated()) {
      router.replace('/branch-manager/login')
      return
    }
    
    loadStudentData()
    loadDynamicData()
  }, [studentId, router])

  const loadStudentData = async () => {
    try {
      setIsLoading(true)
      
      // Mock student data for editing
      const mockStudentData = {
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@email.com",
        phone: "+1234567893",
        password: "",
        gender: "Female",
        dateOfBirth: "1995-03-20",
        studentId: "STU001",
        address: "789 Student Avenue",
        area: "Downtown",
        city: "City Center",
        state: "State",
        zipCode: "12345",
        country: "India",
        occupation: "Software Engineer",
        company: "Tech Corp",
        workAddress: "123 Tech Street, Tech City",
        emergencyContactName: "Robert Johnson",
        emergencyContactPhone: "+1234567894",
        emergencyContactRelation: "Father",
        branch: "branch_001",
        courses: ["course_001", "course_002"],
        medicalConditions: "None",
        notes: "Excellent student with great dedication",
        joinDate: "2024-01-15"
      }

      setFormData(mockStudentData)
    } catch (error) {
      console.error('Error loading student data:', error)
      toast({
        title: "Error",
        description: "Failed to load student data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadDynamicData = async () => {
    try {
      const currentUser = BranchManagerAuth.getCurrentUser()
      const mockBranches = [
        { 
          id: "branch_001", 
          name: currentUser?.branch_name || "Main Branch",
          location: "City Center"
        }
      ]

      const mockCourses = [
        { id: "course_001", title: "Martial Arts Beginner", category: "Martial Arts" },
        { id: "course_002", title: "Yoga Intermediate", category: "Yoga" },
        { id: "course_003", title: "Dance Advanced", category: "Dance" },
        { id: "course_004", title: "Fitness Training", category: "Fitness" }
      ]

      setBranches(mockBranches)
      setCourses(mockCourses)
    } catch (error) {
      console.error('Error loading dynamic data:', error)
    } finally {
      setIsLoadingBranches(false)
      setIsLoadingCourses(false)
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Personal Information validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (!formData.branch) {
      newErrors.branch = "Branch assignment is required"
    }

    if (formData.courses.length === 0) {
      newErrors.courses = "At least one course assignment is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleCourseToggle = (courseId: string) => {
    const currentCourses = formData.courses
    const updatedCourses = currentCourses.includes(courseId)
      ? currentCourses.filter(id => id !== courseId)
      : [...currentCourses, courseId]
    
    handleInputChange('courses', updatedCourses)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      // Mock API call - in real implementation, this would update the student
      await new Promise(resolve => setTimeout(resolve, 2000))

      setShowSuccessPopup(true)
      
      toast({
        title: "Success",
        description: "Student updated successfully",
      })

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/branch-manager-dashboard/students/${studentId}`)
      }, 1500)

    } catch (error) {
      console.error('Error updating student:', error)
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader currentPage="Edit Student" />
        <main className="w-full p-4 lg:py-4 px-19">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="bg-white rounded-lg p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader currentPage="Edit Student" />
      
      <main className="w-full p-4 lg:py-4 px-19">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/branch-manager-dashboard/students/${studentId}`)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Student Details</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
                <p className="text-sm text-gray-500">Update student information and course assignments</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={errors.firstName ? "border-red-500" : ""}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={errors.lastName ? "border-red-500" : ""}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-600">{errors.lastName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={errors.phone ? "border-red-500" : ""}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Leave blank to keep current password"
                    />
                    <p className="text-xs text-gray-500">Leave blank to keep current password</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      placeholder="Enter student ID"
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>Address Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">Area</Label>
                    <Input
                      id="area"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      placeholder="Enter area"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="Enter zip code"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Professional Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      placeholder="Enter occupation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workAddress">Work Address</Label>
                  <Input
                    id="workAddress"
                    value={formData.workAddress}
                    onChange={(e) => handleInputChange('workAddress', e.target.value)}
                    placeholder="Enter work address"
                  />
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      placeholder="Enter contact name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                      placeholder="Enter contact phone"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactRelation">Relationship</Label>
                    <Input
                      id="emergencyContactRelation"
                      value={formData.emergencyContactRelation}
                      onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                      placeholder="Enter relationship"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>Course Assignments</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch *</Label>
                  <Select value={formData.branch} onValueChange={(value) => handleInputChange('branch', value)}>
                    <SelectTrigger className={errors.branch ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.branch && (
                    <p className="text-xs text-red-600">{errors.branch}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Course Assignments *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {courses.map((course) => (
                      <div key={course.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`course-${course.id}`}
                          checked={formData.courses.includes(course.id)}
                          onCheckedChange={() => handleCourseToggle(course.id)}
                        />
                        <Label htmlFor={`course-${course.id}`} className="text-sm">
                          {course.title}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.courses && (
                    <p className="text-xs text-red-600">{errors.courses}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <span>Additional Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medicalConditions">Medical Conditions</Label>
                  <Textarea
                    id="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                    placeholder="Enter any medical conditions or allergies"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter any additional notes"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="joinDate">Join Date</Label>
                  <Input
                    id="joinDate"
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => handleInputChange('joinDate', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/branch-manager-dashboard/students/${studentId}`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Student'
                )}
              </Button>
            </div>
          </form>

          {/* Success Popup */}
          {showSuccessPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Updated Successfully!</h3>
                  <p className="text-gray-600 mb-4">The student information has been updated successfully.</p>
                  <Button
                    onClick={() => router.push(`/branch-manager-dashboard/students/${studentId}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    View Student Details
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
