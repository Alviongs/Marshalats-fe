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
import { ArrowLeft, User, Award, MapPin, Phone, X, Loader2, AlertCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"
import { useToast } from "@/hooks/use-toast"

export default function BranchManagerEditCoachPage() {
  const router = useRouter()
  const params = useParams()
  const coachId = params.id as string
  const { toast } = useToast()

  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "", // Optional password field for updates
    gender: "",
    dateOfBirth: "",
    address: "",
    area: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",

    // Professional Information
    designation: "",
    experience: "",
    qualifications: "",
    certifications: "",
    specializations: [] as string[],

    // Assignment Details
    branch: "",
    courses: [] as string[],
    salary: "",
    joinDate: "",

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",

    // Additional Information
    achievements: "",
    notes: "",
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Dynamic data states
  const [designations, setDesignations] = useState<string[]>([])
  const [specializations, setSpecializations] = useState<string[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])

  // Loading states for dynamic data
  const [isLoadingDesignations, setIsLoadingDesignations] = useState(true)
  const [isLoadingSpecializations, setIsLoadingSpecializations] = useState(true)
  const [isLoadingBranches, setIsLoadingBranches] = useState(true)
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)

  useEffect(() => {
    // Check authentication first
    if (!BranchManagerAuth.isAuthenticated()) {
      router.replace('/branch-manager/login')
      return
    }
    
    loadCoachData()
    loadDynamicData()
  }, [coachId, router])

  const loadCoachData = async () => {
    try {
      setIsLoading(true)
      
      // Mock coach data for editing
      const mockCoachData = {
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@marshalats.com",
        phone: "+1234567891",
        password: "",
        gender: "Male",
        dateOfBirth: "1985-05-15",
        address: "456 Coach Street",
        area: "Downtown",
        city: "City Center",
        state: "State",
        zipCode: "12345",
        country: "India",
        designation: "Senior Coach",
        experience: "10",
        qualifications: "Bachelor's in Sports Science, Certified Personal Trainer",
        certifications: "Black Belt Karate, CPR Certified, First Aid Certified",
        specializations: ["Martial Arts", "Self Defense", "Fitness Training"],
        branch: "branch_001",
        courses: ["course_001", "course_002"],
        salary: "50000",
        joinDate: "2023-01-15",
        emergencyContactName: "Jane Smith",
        emergencyContactPhone: "+1234567892",
        emergencyContactRelation: "Spouse",
        achievements: "Regional Karate Champion 2020, Best Coach Award 2023",
        notes: "Excellent coach with great student feedback"
      }

      setFormData(mockCoachData)
    } catch (error) {
      console.error('Error loading coach data:', error)
      toast({
        title: "Error",
        description: "Failed to load coach data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadDynamicData = async () => {
    try {
      // Mock dynamic data
      const mockDesignations = ["Senior Coach", "Junior Coach", "Head Coach", "Assistant Coach"]
      const mockSpecializations = [
        "Martial Arts", "Yoga", "Dance", "Fitness Training", "Self Defense", 
        "Meditation", "Pilates", "Aerobics", "Weight Training"
      ]

      const currentUser = BranchManagerAuth.getUser()
      const mockBranches = [
        { 
          id: "branch_001", 
          name: currentUser?.branch_name || "Main Branch",
          location: "City Center"
        }
      ]

      const mockCourses = [
        { id: "course_001", title: "Martial Arts Beginner", category: "Martial Arts" },
        { id: "course_002", title: "Self Defense Advanced", category: "Self Defense" },
        { id: "course_003", title: "Fitness Training", category: "Fitness" },
        { id: "course_004", title: "Yoga Intermediate", category: "Yoga" }
      ]

      setDesignations(mockDesignations)
      setSpecializations(mockSpecializations)
      setBranches(mockBranches)
      setCourses(mockCourses)
    } catch (error) {
      console.error('Error loading dynamic data:', error)
    } finally {
      setIsLoadingDesignations(false)
      setIsLoadingSpecializations(false)
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

    if (!formData.designation) {
      newErrors.designation = "Designation is required"
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

  const handleSpecializationToggle = (specialization: string) => {
    const currentSpecializations = formData.specializations
    const updatedSpecializations = currentSpecializations.includes(specialization)
      ? currentSpecializations.filter(s => s !== specialization)
      : [...currentSpecializations, specialization]
    
    handleInputChange('specializations', updatedSpecializations)
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

      // Mock API call - in real implementation, this would update the coach
      await new Promise(resolve => setTimeout(resolve, 2000))

      setShowSuccessPopup(true)
      
      toast({
        title: "Success",
        description: "Coach updated successfully",
      })

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/branch-manager-dashboard/coaches/${coachId}`)
      }, 1500)

    } catch (error) {
      console.error('Error updating coach:', error)
      toast({
        title: "Error",
        description: "Failed to update coach",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendCredentials = async () => {
    try {
      setIsSendingEmail(true)
      
      // Mock email sending
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Success",
        description: "Credentials sent successfully to coach's email",
      })
    } catch (error) {
      console.error('Error sending credentials:', error)
      toast({
        title: "Error",
        description: "Failed to send credentials",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader currentPage="Edit Coach" />
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
      <BranchManagerDashboardHeader currentPage="Edit Coach" />
      
      <main className="w-full p-4 lg:py-4 px-19">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/branch-manager-dashboard/coaches/${coachId}`)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Coach Details</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Coach</h1>
                <p className="text-sm text-gray-500">Update coach information and assignments</p>
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
                    <Label htmlFor="joinDate">Join Date</Label>
                    <Input
                      id="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => handleInputChange('joinDate', e.target.value)}
                    />
                  </div>
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation *</Label>
                    <Select value={formData.designation} onValueChange={(value) => handleInputChange('designation', value)}>
                      <SelectTrigger className={errors.designation ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        {designations.map((designation) => (
                          <SelectItem key={designation} value={designation}>
                            {designation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.designation && (
                      <p className="text-xs text-red-600">{errors.designation}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience (Years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      placeholder="Enter years of experience"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary</Label>
                    <Input
                      id="salary"
                      type="number"
                      min="0"
                      value={formData.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      placeholder="Enter salary amount"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch Assignment *</Label>
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
                </div>

                <div className="space-y-2">
                  <Label>Specializations</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {specializations.map((specialization) => (
                      <div key={specialization} className="flex items-center space-x-2">
                        <Checkbox
                          id={`spec-${specialization}`}
                          checked={formData.specializations.includes(specialization)}
                          onCheckedChange={() => handleSpecializationToggle(specialization)}
                        />
                        <Label htmlFor={`spec-${specialization}`} className="text-sm">
                          {specialization}
                        </Label>
                      </div>
                    ))}
                  </div>
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

                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    value={formData.qualifications}
                    onChange={(e) => handleInputChange('qualifications', e.target.value)}
                    placeholder="Enter qualifications (comma separated)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                    placeholder="Enter certifications (comma separated)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleSendCredentials}
                disabled={isSendingEmail}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Credentials via Email'
                )}
              </Button>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/branch-manager-dashboard/coaches/${coachId}`)}
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
                    'Update Coach'
                  )}
                </Button>
              </div>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Coach Updated Successfully!</h3>
                  <p className="text-gray-600 mb-4">The coach information has been updated successfully.</p>
                  <Button
                    onClick={() => router.push(`/branch-manager-dashboard/coaches/${coachId}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    View Coach Details
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
