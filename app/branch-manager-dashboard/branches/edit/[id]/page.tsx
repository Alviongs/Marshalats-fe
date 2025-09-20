"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building, MapPin, Users, Clock, CreditCard, AlertCircle, Loader2, X } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"

interface FormData {
  branch: {
    name: string
    code: string
    email: string
    phone: string
    address: {
      line1: string
      area: string
      city: string
      state: string
      pincode: string
      country: string
    }
  }
  location_id: string
  manager_id: string
  operational_details: {
    courses_offered: string[]
    timings: Array<{
      day: string
      open: string
      close: string
    }>
    holidays: string[]
  }
  assignments: {
    accessories_available: boolean
    courses: string[]
    branch_admins: string[]
  }
  bank_details: {
    bank_name: string
    account_number: string
    upi_id: string
  }
}

interface FormErrors {
  [key: string]: string
}

export default function EditBranch() {
  const router = useRouter()
  const params = useParams()
  const branchId = params.id as string
  const { toast } = useToast()

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  // State for new timing form
  const [newTiming, setNewTiming] = useState({
    day: "",
    open: "07:00",
    close: "19:00"
  })

  const [formData, setFormData] = useState<FormData>({
    branch: {
      name: "",
      code: "",
      email: "",
      phone: "",
      address: {
        line1: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
        country: "India"
      }
    },
    manager_id: "",
    operational_details: {
      courses_offered: [],
      timings: [],
      holidays: []
    },
    assignments: {
      accessories_available: false,
      courses: [],
      branch_admins: []
    },
    bank_details: {
      bank_name: "",
      account_number: "",
      upi_id: ""
    },
    location_id: ""
  })

  // Dynamic data from APIs
  const [availableManagers, setAvailableManagers] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [availableAdmins, setAvailableAdmins] = useState<any[]>([])
  const [states, setStates] = useState<{ state: string; location_count: number }[]>([])

  // Loading states for dynamic data
  const [isLoadingManagers, setIsLoadingManagers] = useState(true)
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true)
  const [isLoadingStates, setIsLoadingStates] = useState(true)

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  // Fetch branch data and dynamic options on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true)

        const token = BranchManagerAuth.getToken()
        if (!token) {
          throw new Error("Authentication token not found. Please login again.")
        }

        // Fetch branch data and dynamic options in parallel
        const [branchResponse, managersResponse, coursesResponse, adminsResponse, statesResponse] = await Promise.allSettled([
          // Fetch branch data
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/branches/${branchId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          // Fetch branch managers from branch-managers collection
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/branch-managers?active_only=true&limit=100`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          // Fetch courses
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses?active_only=true&limit=100`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          // Fetch admins (users with admin role)
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users?role=admin&limit=100`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          // Fetch states (public endpoint)
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/locations/public/states?active_only=true`)
        ])

        // Handle branch data
        if (branchResponse.status === 'fulfilled' && branchResponse.value.ok) {
          const branchData = await branchResponse.value.json()

          // Map API data to form structure
          setFormData({
            branch: {
              name: branchData.branch?.name || "",
              code: branchData.branch?.code || "",
              email: branchData.branch?.email || "",
              phone: branchData.branch?.phone || "",
              address: {
                line1: branchData.branch?.address?.line1 || "",
                area: branchData.branch?.address?.area || "",
                city: branchData.branch?.address?.city || "",
                state: branchData.branch?.address?.state || "",
                pincode: branchData.branch?.address?.pincode || "",
                country: branchData.branch?.address?.country || "India"
              }
            },
            manager_id: branchData.manager_id || "",
            operational_details: {
              courses_offered: branchData.operational_details?.courses_offered || [],
              timings: branchData.operational_details?.timings || [],
              holidays: branchData.operational_details?.holidays || []
            },
            assignments: {
              accessories_available: branchData.assignments?.accessories_available || false,
              courses: branchData.assignments?.courses || [],
              branch_admins: branchData.assignments?.branch_admins || []
            },
            bank_details: {
              bank_name: branchData.bank_details?.bank_name || "",
              account_number: branchData.bank_details?.account_number || "",
              upi_id: branchData.bank_details?.upi_id || ""
            },
            location_id: branchData.location_id || ""
          })
        } else {
          if (branchResponse.status === 'fulfilled' && branchResponse.value.status === 404) {
            throw new Error("Branch not found")
          }
          throw new Error("Failed to fetch branch data")
        }

        // Handle branch managers data
        if (managersResponse.status === 'fulfilled' && managersResponse.value.ok) {
          const managersData = await managersResponse.value.json()
          const managers = (managersData.branch_managers || []).map((manager: any) => ({
            id: manager.id,
            name: manager.full_name || `${manager.personal_info?.first_name || ''} ${manager.personal_info?.last_name || ''}`.trim(),
            email: manager.email || manager.contact_info?.email || ''
          }))
          setAvailableManagers(managers)
        }
        setIsLoadingManagers(false)

        // Handle courses data
        if (coursesResponse.status === 'fulfilled' && coursesResponse.value.ok) {
          const coursesData = await coursesResponse.value.json()
          const courses = (coursesData.courses || []).map((course: any) => ({
            id: course.id,
            name: course.title || course.name
          }))
          setAvailableCourses(courses)
        }
        setIsLoadingCourses(false)

        // Handle admins data
        if (adminsResponse.status === 'fulfilled' && adminsResponse.value.ok) {
          const adminsData = await adminsResponse.value.json()
          const admins = (adminsData.users || []).map((admin: any) => ({
            id: admin.id,
            name: admin.full_name || `${admin.first_name || ''} ${admin.last_name || ''}`.trim()
          }))
          setAvailableAdmins(admins)
        }
        setIsLoadingAdmins(false)

        // Handle states data
        if (statesResponse.status === 'fulfilled' && statesResponse.value.ok) {
          const statesData = await statesResponse.value.json()
          setStates(statesData.states || [])
        } else {
          // Fallback to some common states
          setStates([
            { state: "Telangana", location_count: 1 },
            { state: "Maharashtra", location_count: 1 },
            { state: "Karnataka", location_count: 1 },
            { state: "Tamil Nadu", location_count: 1 }
          ])
        }
        setIsLoadingStates(false)

      } catch (error) {
        console.error("Error fetching data:", error)
        setErrors({ general: error instanceof Error ? error.message : 'Failed to load data' })
        setIsLoadingManagers(false)
        setIsLoadingCourses(false)
        setIsLoadingAdmins(false)
        setIsLoadingStates(false)
      } finally {
        setIsLoading(false)
      }
    }

    if (branchId) {
      fetchAllData()
    }
  }, [branchId])

  // Helper function to handle nested form data updates
  const handleInputChange = (path: string, value: any) => {
    const keys = path.split('.')
    setFormData(prev => {
      const newData = { ...prev }
      let current: any = newData

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  const addTiming = () => {
    if (newTiming.day && newTiming.open && newTiming.close) {
      // Check if day already exists
      const existingTimingIndex = formData.operational_details.timings.findIndex(t => t.day === newTiming.day)

      if (existingTimingIndex >= 0) {
        // Update existing timing
        setFormData(prev => ({
          ...prev,
          operational_details: {
            ...prev.operational_details,
            timings: prev.operational_details.timings.map((timing, index) =>
              index === existingTimingIndex ? { ...newTiming } : timing
            )
          }
        }))
      } else {
        // Add new timing
        setFormData(prev => ({
          ...prev,
          operational_details: {
            ...prev.operational_details,
            timings: [...prev.operational_details.timings, { ...newTiming }]
          }
        }))
      }

      // Reset form
      setNewTiming({
        day: "",
        open: "07:00",
        close: "19:00"
      })
    }
  }

  const removeTiming = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      operational_details: {
        ...prev.operational_details,
        timings: prev.operational_details.timings.filter((_, index) => index !== dayIndex)
      }
    }))
  }

  const addHoliday = (date: string) => {
    if (date && !formData.operational_details.holidays.includes(date)) {
      setFormData(prev => ({
        ...prev,
        operational_details: {
          ...prev.operational_details,
          holidays: [...prev.operational_details.holidays, date]
        }
      }))
      // Clear the input
      const input = document.getElementById('holidayDate') as HTMLInputElement
      if (input) input.value = ''
    }
  }

  const removeHoliday = (holidayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      operational_details: {
        ...prev.operational_details,
        holidays: prev.operational_details.holidays.filter((_, index) => index !== holidayIndex)
      }
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.branch.name.trim()) {
      newErrors.branchName = "Branch name is required"
    }

    if (!formData.branch.code.trim()) {
      newErrors.branchCode = "Branch code is required"
    }

    if (!formData.branch.email.trim()) {
      newErrors.branchEmail = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.branch.email)) {
      newErrors.branchEmail = "Please enter a valid email address"
    }

    if (!formData.branch.phone.trim()) {
      newErrors.branchPhone = "Phone number is required"
    }

    if (!formData.branch.address.line1.trim()) {
      newErrors.addressLine1 = "Address line 1 is required"
    }

    if (!formData.branch.address.city.trim()) {
      newErrors.city = "City is required"
    }

    if (!formData.branch.address.state.trim()) {
      newErrors.state = "State is required"
    }

    if (!formData.branch.address.pincode.trim()) {
      newErrors.pincode = "Pincode is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const token = BranchManagerAuth.getToken()
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "No authentication token available. Please login again.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/branches/${branchId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || result.message || `Failed to update branch (${response.status})`)
      }

      console.log("Branch updated successfully:", result)
      setShowSuccessPopup(true)

      setTimeout(() => {
        setShowSuccessPopup(false)
        router.push("/branch-manager-dashboard/branches")
      }, 2000)

    } catch (error) {
      console.error("Error updating branch:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update branch',
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader currentPage="Edit Branch" />
        <main className="w-full p-4 lg:p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading branch data...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader currentPage="Edit Branch" />

      <main className="w-full p-4 lg:p-6 xl:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">Edit Branch</h1>
            <p className="text-gray-600 mt-2">Update branch information and settings</p>
          </div>
        </div>

        {/* Error Display */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Row 1, Column 1: Branch & Address Information */}
            <Card className="rounded-2xl shadow-sm border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-[#4f5077]">
                  <Building className="h-5 w-5" />
                  <span>Branch & Address Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Branch Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#4f5077] border-b border-gray-200 pb-2">Branch Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="branchName" className="text-sm font-medium text-[#7D8592]">Branch Name *</Label>
                      <Input
                        id="branchName"
                        value={formData.branch.name}
                        onChange={(e) => handleInputChange('branch.name', e.target.value)}
                        className={`h-12 bg-gray-50 border-gray-200 rounded-xl ${errors.branchName ? 'border-red-500' : ''}`}
                        placeholder="Enter branch name"
                      />
                      {errors.branchName && <p className="text-red-500 text-xs">{errors.branchName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branchCode" className="text-sm font-medium text-[#7D8592]">Branch Code *</Label>
                      <Input
                        id="branchCode"
                        value={formData.branch.code}
                        onChange={(e) => handleInputChange('branch.code', e.target.value)}
                        className={`h-12 bg-gray-50 border-gray-200 rounded-xl ${errors.branchCode ? 'border-red-500' : ''}`}
                        placeholder="Enter branch code"
                      />
                      {errors.branchCode && <p className="text-red-500 text-xs">{errors.branchCode}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branchEmail" className="text-sm font-medium text-[#7D8592]">Email *</Label>
                      <Input
                        id="branchEmail"
                        type="email"
                        value={formData.branch.email}
                        onChange={(e) => handleInputChange('branch.email', e.target.value)}
                        className={`h-12 bg-gray-50 border-gray-200 rounded-xl ${errors.branchEmail ? 'border-red-500' : ''}`}
                        placeholder="Enter email address"
                      />
                      {errors.branchEmail && <p className="text-red-500 text-xs">{errors.branchEmail}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branchPhone" className="text-sm font-medium text-[#7D8592]">Phone *</Label>
                      <Input
                        id="branchPhone"
                        value={formData.branch.phone}
                        onChange={(e) => handleInputChange('branch.phone', e.target.value)}
                        className={`h-12 bg-gray-50 border-gray-200 rounded-xl ${errors.branchPhone ? 'border-red-500' : ''}`}
                        placeholder="Enter phone number"
                      />
                      {errors.branchPhone && <p className="text-red-500 text-xs">{errors.branchPhone}</p>}
                    </div>
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#4f5077] border-b border-gray-200 pb-2">Address Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="addressLine1" className="text-sm font-medium text-[#7D8592]">Address Line 1 *</Label>
                      <Input
                        id="addressLine1"
                        value={formData.branch.address.line1}
                        onChange={(e) => handleInputChange('branch.address.line1', e.target.value)}
                        className={`h-12 bg-gray-50 border-gray-200 rounded-xl ${errors.addressLine1 ? 'border-red-500' : ''}`}
                        placeholder="Enter address line 1"
                      />
                      {errors.addressLine1 && <p className="text-red-500 text-xs">{errors.addressLine1}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area" className="text-sm font-medium text-[#7D8592]">Area</Label>
                      <Input
                        id="area"
                        value={formData.branch.address.area}
                        onChange={(e) => handleInputChange('branch.address.area', e.target.value)}
                        className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                        placeholder="Enter area"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium text-[#7D8592]">City *</Label>
                      <Input
                        id="city"
                        value={formData.branch.address.city}
                        onChange={(e) => handleInputChange('branch.address.city', e.target.value)}
                        className={`h-12 bg-gray-50 border-gray-200 rounded-xl ${errors.city ? 'border-red-500' : ''}`}
                        placeholder="Enter city"
                      />
                      {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-medium text-[#7D8592]">State *</Label>
                      <Select
                        value={formData.branch.address.state}
                        onValueChange={(value) => handleInputChange('branch.address.state', value)}
                      >
                        <SelectTrigger className={`h-12 bg-gray-50 border-gray-200 rounded-xl ${errors.state ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingStates ? (
                            <SelectItem value="loading" disabled>Loading states...</SelectItem>
                          ) : (
                            states.map((state) => (
                              <SelectItem key={state.state} value={state.state}>
                                {state.state}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.state && <p className="text-red-500 text-xs">{errors.state}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="text-sm font-medium text-[#7D8592]">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={formData.branch.address.pincode}
                        onChange={(e) => handleInputChange('branch.address.pincode', e.target.value)}
                        className={`h-12 bg-gray-50 border-gray-200 rounded-xl ${errors.pincode ? 'border-red-500' : ''}`}
                        placeholder="Enter pincode"
                      />
                      {errors.pincode && <p className="text-red-500 text-xs">{errors.pincode}</p>}
                    </div>
                  </div>
                </div>

                {/* Branch Manager */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#4f5077] border-b border-gray-200 pb-2">Branch Manager</h3>
                  <div className="space-y-2">
                    <Label htmlFor="manager" className="text-sm font-medium text-[#7D8592]">Assign Manager</Label>
                    <Select
                      value={formData.manager_id}
                      onValueChange={(value) => handleInputChange('manager_id', value)}
                    >
                      <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl">
                        <SelectValue placeholder="Select branch manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingManagers ? (
                          <SelectItem value="loading" disabled>Loading managers...</SelectItem>
                        ) : (
                          availableManagers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name} ({manager.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Row 1, Column 2: Course & Staff Assignments */}
            <Card className="rounded-2xl shadow-sm border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-[#4f5077]">
                  <Users className="h-5 w-5" />
                  <span>Course & Staff Assignments</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Accessories Available */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#4f5077] border-b border-gray-200 pb-2">Accessories</h3>
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="accessories"
                      checked={formData.assignments.accessories_available}
                      onCheckedChange={(checked) => handleInputChange('assignments.accessories_available', checked)}
                    />
                    <Label htmlFor="accessories" className="text-sm font-medium text-[#7D8592]">
                      Accessories Available
                    </Label>
                  </div>
                </div>

                {/* Course Assignments */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#4f5077] border-b border-gray-200 pb-2">Course Assignments</h3>
                  <div className="space-y-3">
                    {isLoadingCourses ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-500">Loading courses...</span>
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {availableCourses.map((course) => (
                          <div key={course.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={`course-${course.id}`}
                              checked={formData.assignments.courses.includes(course.id)}
                              onCheckedChange={(checked) => {
                                const currentCourses = formData.assignments.courses
                                const updatedCourses = checked
                                  ? [...currentCourses, course.id]
                                  : currentCourses.filter(id => id !== course.id)
                                handleInputChange('assignments.courses', updatedCourses)
                              }}
                            />
                            <Label htmlFor={`course-${course.id}`} className="text-sm text-[#7D8592]">
                              {course.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Selected Courses Display */}
                    {formData.assignments.courses.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">Selected Courses:</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.assignments.courses.map((courseId) => {
                            const course = availableCourses.find(c => c.id === courseId)
                            return course ? (
                              <Badge key={courseId} variant="secondary" className="text-xs">
                                {course.name}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Branch Admin Assignments */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#4f5077] border-b border-gray-200 pb-2">Branch Admin Assignments</h3>
                  <div className="space-y-3">
                    {isLoadingAdmins ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-500">Loading admins...</span>
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {availableAdmins.map((admin) => (
                          <div key={admin.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={`admin-${admin.id}`}
                              checked={formData.assignments.branch_admins.includes(admin.id)}
                              onCheckedChange={(checked) => {
                                const currentAdmins = formData.assignments.branch_admins
                                const updatedAdmins = checked
                                  ? [...currentAdmins, admin.id]
                                  : currentAdmins.filter(id => id !== admin.id)
                                handleInputChange('assignments.branch_admins', updatedAdmins)
                              }}
                            />
                            <Label htmlFor={`admin-${admin.id}`} className="text-sm text-[#7D8592]">
                              {admin.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Selected Admins Display */}
                    {formData.assignments.branch_admins.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">Selected Admins:</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.assignments.branch_admins.map((adminId) => {
                            const admin = availableAdmins.find(a => a.id === adminId)
                            return admin ? (
                              <Badge key={adminId} variant="secondary" className="text-xs">
                                {admin.name}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Row 2, Column 1: Operational Details */}
            <Card className="rounded-2xl shadow-sm border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-[#4f5077]">
                  <Clock className="h-5 w-5" />
                  <span>Operational Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Operating Hours */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#4f5077] border-b border-gray-200 pb-2">Operating Hours</h3>

                  {/* Add New Timing Form */}
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <p className="text-sm font-medium text-[#7D8592]">Add Operating Hours</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Select
                        value={newTiming.day}
                        onValueChange={(value) => setNewTiming(prev => ({ ...prev, day: value }))}
                      >
                        <SelectTrigger className="h-10 bg-white border-gray-200 rounded-lg">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="time"
                        value={newTiming.open}
                        onChange={(e) => setNewTiming(prev => ({ ...prev, open: e.target.value }))}
                        className="h-10 bg-white border-gray-200 rounded-lg"
                      />
                      <Input
                        type="time"
                        value={newTiming.close}
                        onChange={(e) => setNewTiming(prev => ({ ...prev, close: e.target.value }))}
                        className="h-10 bg-white border-gray-200 rounded-lg"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={addTiming}
                      size="sm"
                      className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg"
                    >
                      Add Timing
                    </Button>
                  </div>

                  {/* Current Timings */}
                  <div className="space-y-2">
                    {formData.operational_details.timings.map((timing, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="text-xs">
                            {timing.day}
                          </Badge>
                          <span className="text-sm text-[#7D8592]">
                            {timing.open} - {timing.close}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTiming(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {formData.operational_details.timings.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No operating hours added yet</p>
                    )}
                  </div>
                </div>

                {/* Holidays */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#4f5077] border-b border-gray-200 pb-2">Holidays</h3>

                  {/* Add Holiday Form */}
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <p className="text-sm font-medium text-[#7D8592]">Add Holiday</p>
                    <div className="flex space-x-3">
                      <Input
                        id="holidayDate"
                        type="date"
                        className="h-10 bg-white border-gray-200 rounded-lg flex-1"
                        onChange={(e) => {
                          if (e.target.value) {
                            addHoliday(e.target.value)
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Current Holidays */}
                  <div className="space-y-2">
                    {formData.operational_details.holidays.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.operational_details.holidays.map((holiday, index) => (
                          <Badge key={index} variant="secondary" className="text-xs flex items-center space-x-1">
                            <span>{new Date(holiday).toLocaleDateString()}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeHoliday(index)}
                              className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No holidays added yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Row 2, Column 2: Bank Details */}
            <Card className="rounded-2xl shadow-sm border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-[#4f5077]">
                  <CreditCard className="h-5 w-5" />
                  <span>Bank Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName" className="text-sm font-medium text-[#7D8592]">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bank_details.bank_name}
                      onChange={(e) => handleInputChange('bank_details.bank_name', e.target.value)}
                      className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                      placeholder="Enter bank name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber" className="text-sm font-medium text-[#7D8592]">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={formData.bank_details.account_number}
                      onChange={(e) => handleInputChange('bank_details.account_number', e.target.value)}
                      className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                      placeholder="Enter account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upiId" className="text-sm font-medium text-[#7D8592]">UPI ID</Label>
                    <Input
                      id="upiId"
                      value={formData.bank_details.upi_id}
                      onChange={(e) => handleInputChange('bank_details.upi_id', e.target.value)}
                      className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                      placeholder="Enter UPI ID"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-6 py-2 h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 h-12 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Branch'
              )}
            </Button>
          </div>
        </form>

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Branch Updated Successfully!</h3>
                <p className="text-gray-600 mb-6">The branch information has been updated successfully.</p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}