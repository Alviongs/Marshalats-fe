"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, User, MapPin, Phone, Building, Loader2, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"
import { useToast } from "@/hooks/use-toast"

export default function CreateStudentPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdStudentId, setCreatedStudentId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    dateOfBirth: "",

    // Address Information
    address: "",
    area: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",

    // Course Information
    selectedLocation: "",
    selectedBranch: "",
    selectedCategory: "",
    selectedCourse: "",
    selectedDuration: "",

    // Course & Staff Assignments
    assignedCoach: "",
    startDate: "",
    preferredTimeSlot: "",

    // Payment Information
    paymentMethod: "",
    paymentStatus: "Pending",
    amountPaid: "",
    totalAmount: "",
    paymentDate: "",

    // Additional Information
    medicalConditions: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    notes: "",
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [locations, setLocations] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [durations, setDurations] = useState<any[]>([])
  const [coaches, setCoaches] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setIsLoadingData(true)
      
      // Load locations from branches (using state field)
      const branchesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/branches/public/details`)
      if (branchesResponse.ok) {
        const branchesData = await branchesResponse.json()
        const allBranches = branchesData.branches || []
        setBranches(allBranches)
        
        // Extract unique locations from branches
        const uniqueLocations = [...new Set(allBranches.map((branch: any) => branch.state).filter(Boolean))]
        setLocations(uniqueLocations.map(state => ({ state, name: state })))
      }

      // Load categories
      const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories/public/details?active_only=true`)
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories || [])
      }

      // Load courses
      const coursesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/public/details`)
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json()
        setCourses(coursesData.courses || [])
      }

      // Load durations
      const durationsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/durations/public/details`)
      if (durationsResponse.ok) {
        const durationsData = await durationsResponse.json()
        setDurations(durationsData.durations || [])
      }

      // Load coaches
      const token = BranchManagerAuth.getToken()
      if (token) {
        const coachesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coaches`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (coachesResponse.ok) {
          const coachesData = await coachesResponse.json()
          setCoaches(coachesData.coaches || coachesData || [])
        }
      }

    } catch (error) {
      console.error('Error loading initial data:', error)
      toast({
        title: "Error",
        description: "Failed to load form data",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  // Filter branches based on selected location
  const filteredBranches = formData.selectedLocation 
    ? branches.filter(branch => branch.state === formData.selectedLocation)
    : branches

  // Filter courses based on selected category
  const filteredCourses = formData.selectedCategory
    ? courses.filter(course => course.category_id === formData.selectedCategory)
    : courses

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

    if (!formData.password.trim()) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long"
    }

    if (!formData.selectedBranch) {
      newErrors.selectedBranch = "Branch selection is required"
    }

    if (!formData.selectedCourse) {
      newErrors.selectedCourse = "Course selection is required"
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

    // Handle dependent dropdowns
    if (field === 'selectedLocation') {
      setFormData(prev => ({ ...prev, selectedBranch: "" }))
    }
    if (field === 'selectedCategory') {
      setFormData(prev => ({ ...prev, selectedCourse: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      const token = BranchManagerAuth.getToken()
      if (!token) {
        throw new Error("Authentication token not found. Please login again.")
      }

      const payload = {
        personal_info: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          gender: formData.gender,
          date_of_birth: formData.dateOfBirth
        },
        contact_info: {
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.address,
            area: formData.area,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zipCode,
            country: formData.country
          }
        },
        course_enrollment: {
          branch_id: formData.selectedBranch,
          course_id: formData.selectedCourse,
          coach_id: formData.assignedCoach,
          start_date: formData.startDate,
          preferred_time_slot: formData.preferredTimeSlot,
          duration_id: formData.selectedDuration
        },
        payment_info: {
          payment_method: formData.paymentMethod,
          payment_status: formData.paymentStatus,
          amount_paid: formData.amountPaid ? parseFloat(formData.amountPaid) : 0,
          total_amount: formData.totalAmount ? parseFloat(formData.totalAmount) : 0,
          payment_date: formData.paymentDate
        },
        emergency_contact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelation
        },
        password: formData.password,
        medical_conditions: formData.medicalConditions,
        notes: formData.notes
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || errorData.message || `Failed to create student (${response.status})`)
      }

      const result = await response.json()
      console.log("Student created successfully:", result)

      setCreatedStudentId(result.student_id || result.id)
      setShowSuccessPopup(true)
      
      toast({
        title: "Success",
        description: "Student created successfully",
      })

    } catch (error) {
      console.error('Error creating student:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create student',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader currentPage="Create Student" />
      
      <main className="w-full p-4 lg:py-4 px-19">
        <div className="max-w-4xl mx-auto">
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
                <h1 className="text-2xl font-bold text-[#4F5077]">Create New Student</h1>
                <p className="text-sm text-[#7D8592]">Add a new student and enroll in courses</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-yellow-600" />
                  <span className="text-[#4F5077]">Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#7D8592]">
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
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={errors.password ? "border-red-500" : ""}
                      placeholder="Enter password"
                    />
                    {errors.password && (
                      <p className="text-xs text-red-600">{errors.password}</p>
                    )}
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
                </div>
              </CardContent>
            </Card>

            {/* Course Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-yellow-600" />
                  <span className="text-[#4F5077]">Course Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#7D8592]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="selectedLocation">Location</Label>
                    <Select
                      value={formData.selectedLocation}
                      onValueChange={(value) => handleInputChange('selectedLocation', value)}
                      disabled={isLoadingData}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingData ? "Loading locations..." : "Select location"} />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.state} value={location.state}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selectedBranch">Branch *</Label>
                    <Select
                      value={formData.selectedBranch}
                      onValueChange={(value) => handleInputChange('selectedBranch', value)}
                      disabled={isLoadingData || !formData.selectedLocation}
                    >
                      <SelectTrigger className={errors.selectedBranch ? "border-red-500" : ""}>
                        <SelectValue placeholder={
                          isLoadingData ? "Loading branches..." :
                          !formData.selectedLocation ? "Select location first" :
                          "Select branch"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredBranches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name} - {branch.address?.city || 'Location not specified'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.selectedBranch && (
                      <p className="text-xs text-red-600">{errors.selectedBranch}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selectedCategory">Category</Label>
                    <Select
                      value={formData.selectedCategory}
                      onValueChange={(value) => handleInputChange('selectedCategory', value)}
                      disabled={isLoadingData}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingData ? "Loading categories..." : "Select category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selectedCourse">Course *</Label>
                    <Select
                      value={formData.selectedCourse}
                      onValueChange={(value) => handleInputChange('selectedCourse', value)}
                      disabled={isLoadingData}
                    >
                      <SelectTrigger className={errors.selectedCourse ? "border-red-500" : ""}>
                        <SelectValue placeholder={isLoadingData ? "Loading courses..." : "Select course"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title} - {course.difficulty_level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.selectedCourse && (
                      <p className="text-xs text-red-600">{errors.selectedCourse}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selectedDuration">Duration</Label>
                    <Select
                      value={formData.selectedDuration}
                      onValueChange={(value) => handleInputChange('selectedDuration', value)}
                      disabled={isLoadingData}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingData ? "Loading durations..." : "Select duration"} />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((duration) => (
                          <SelectItem key={duration.id} value={duration.id}>
                            {duration.name} - {duration.duration_months} months
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignedCoach">Assigned Coach</Label>
                    <Select
                      value={formData.assignedCoach}
                      onValueChange={(value) => handleInputChange('assignedCoach', value)}
                      disabled={isLoadingData}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingData ? "Loading coaches..." : "Select coach"} />
                      </SelectTrigger>
                      <SelectContent>
                        {coaches.map((coach) => (
                          <SelectItem key={coach.id} value={coach.id}>
                            {coach.personal_info?.first_name} {coach.personal_info?.last_name} - {coach.professional_info?.specialization || 'General'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredTimeSlot">Preferred Time Slot</Label>
                    <Select
                      value={formData.preferredTimeSlot}
                      onValueChange={(value) => handleInputChange('preferredTimeSlot', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (6:00 AM - 10:00 AM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (2:00 PM - 6:00 PM)</SelectItem>
                        <SelectItem value="evening">Evening (6:00 PM - 10:00 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                  <span className="text-[#4F5077]">Payment Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#7D8592]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleInputChange('paymentMethod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Payment Status</Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value) => handleInputChange('paymentStatus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalAmount">Total Amount</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      value={formData.totalAmount}
                      onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                      placeholder="Enter total amount"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amountPaid">Amount Paid</Label>
                    <Input
                      id="amountPaid"
                      type="number"
                      value={formData.amountPaid}
                      onChange={(e) => handleInputChange('amountPaid', e.target.value)}
                      placeholder="Enter amount paid"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-yellow-600" />
                  <span className="text-[#4F5077]">Location Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#7D8592]">
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

            {/* Emergency Contact & Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-yellow-600" />
                  <span className="text-[#4F5077]">Emergency Contact & Additional Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#7D8592]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      placeholder="Enter contact name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
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
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter any additional notes"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/branch-manager-dashboard/students")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Student...
                  </>
                ) : (
                  'Create Student'
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Created Successfully!</h3>
                  <p className="text-gray-600 mb-4">The student has been created and enrolled in the selected course.</p>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => router.push("/branch-manager-dashboard/students")}
                      className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
                    >
                      View Students
                    </Button>
                    <Button
                      onClick={() => router.push("/branch-manager-dashboard/students")}
                      variant="outline"
                      className="flex-1"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
