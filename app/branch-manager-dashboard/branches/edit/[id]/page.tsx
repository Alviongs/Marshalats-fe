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
  location_id: string  // Add location_id field
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

export default function BranchManagerEditBranch() {
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

  // Dynamic data states
  const [locations, setLocations] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [managers, setManagers] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    // Check authentication first
    if (!BranchManagerAuth.isAuthenticated()) {
      router.replace('/branch-manager/login')
      return
    }
    
    loadBranchData()
    loadDynamicData()
  }, [branchId, router])

  const loadBranchData = async () => {
    try {
      setIsLoading(true)
      
      const currentUser = BranchManagerAuth.getCurrentUser()
      if (!currentUser) {
        throw new Error("User data not found")
      }

      // Mock branch data for editing
      const mockBranchData: FormData = {
        branch: {
          name: currentUser.branch_name || "Main Branch",
          code: "MB001",
          email: "mainbranch@marshalats.com",
          phone: "+1234567890",
          address: {
            line1: "123 Main Street",
            area: "Downtown",
            city: "City Center",
            state: "State",
            pincode: "12345",
            country: "India"
          }
        },
        manager_id: currentUser.id,
        operational_details: {
          courses_offered: ["Martial Arts", "Yoga", "Dance", "Fitness"],
          timings: [
            { day: "Monday", open: "06:00", close: "22:00" },
            { day: "Tuesday", open: "06:00", close: "22:00" },
            { day: "Wednesday", open: "06:00", close: "22:00" },
            { day: "Thursday", open: "06:00", close: "22:00" },
            { day: "Friday", open: "06:00", close: "22:00" },
            { day: "Saturday", open: "07:00", close: "20:00" },
            { day: "Sunday", open: "08:00", close: "18:00" }
          ],
          holidays: ["2024-01-01", "2024-12-25"]
        },
        assignments: {
          accessories_available: true,
          courses: ["course_001", "course_002", "course_003"],
          branch_admins: [currentUser.id]
        },
        bank_details: {
          bank_name: "Main Bank",
          account_number: "1234567890",
          upi_id: "branch@upi"
        },
        location_id: "location_001"
      }

      setFormData(mockBranchData)
    } catch (error) {
      console.error('Error loading branch data:', error)
      toast({
        title: "Error",
        description: "Failed to load branch data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadDynamicData = async () => {
    try {
      setIsLoadingData(true)
      
      // Mock dynamic data
      const mockLocations = [
        { id: "location_001", name: "State 1", state: "State 1" },
        { id: "location_002", name: "State 2", state: "State 2" }
      ]

      const mockCourses = [
        { id: "course_001", title: "Martial Arts Beginner", category: "Martial Arts" },
        { id: "course_002", title: "Yoga Intermediate", category: "Yoga" },
        { id: "course_003", title: "Dance Advanced", category: "Dance" },
        { id: "course_004", title: "Fitness Bootcamp", category: "Fitness" }
      ]

      const currentUser = BranchManagerAuth.getCurrentUser()
      const mockManagers = [
        { 
          id: currentUser?.id || "manager_001", 
          full_name: currentUser?.full_name || "Branch Manager",
          email: currentUser?.email || "manager@branch.com"
        }
      ]

      setLocations(mockLocations)
      setCourses(mockCourses)
      setManagers(mockManagers)
    } catch (error) {
      console.error('Error loading dynamic data:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    // Branch validation
    if (!formData.branch.name.trim()) {
      newErrors['branch.name'] = 'Branch name is required'
    }

    if (!formData.branch.email.trim()) {
      newErrors['branch.email'] = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.branch.email)) {
      newErrors['branch.email'] = 'Please enter a valid email address'
    }

    if (!formData.branch.phone.trim()) {
      newErrors['branch.phone'] = 'Phone number is required'
    }

    // Address validation
    if (!formData.branch.address.line1.trim()) {
      newErrors['branch.address.line1'] = 'Address line 1 is required'
    }

    if (!formData.branch.address.city.trim()) {
      newErrors['branch.address.city'] = 'City is required'
    }

    if (!formData.branch.address.state.trim()) {
      newErrors['branch.address.state'] = 'State is required'
    }

    if (!formData.branch.address.pincode.trim()) {
      newErrors['branch.address.pincode'] = 'Pincode is required'
    }

    if (!formData.manager_id) {
      newErrors['manager_id'] = 'Manager selection is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: any) => {
    const keys = field.split('.')
    setFormData(prev => {
      const updated = { ...prev }
      let current: any = updated
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return updated
    })

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      // Mock API call - in real implementation, this would update the branch
      await new Promise(resolve => setTimeout(resolve, 2000))

      setShowSuccessPopup(true)
      
      toast({
        title: "Success",
        description: "Branch updated successfully",
      })

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/branch-manager-dashboard/branches/${branchId}`)
      }, 1500)

    } catch (error) {
      console.error('Error updating branch:', error)
      toast({
        title: "Error",
        description: "Failed to update branch",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTiming = () => {
    if (newTiming.day && newTiming.open && newTiming.close) {
      const existingIndex = formData.operational_details.timings.findIndex(
        timing => timing.day === newTiming.day
      )

      if (existingIndex >= 0) {
        // Update existing timing
        const updatedTimings = [...formData.operational_details.timings]
        updatedTimings[existingIndex] = newTiming
        handleInputChange('operational_details.timings', updatedTimings)
      } else {
        // Add new timing
        handleInputChange('operational_details.timings', [
          ...formData.operational_details.timings,
          newTiming
        ])
      }

      setNewTiming({ day: "", open: "07:00", close: "19:00" })
    }
  }

  const removeTiming = (index: number) => {
    const updatedTimings = formData.operational_details.timings.filter((_, i) => i !== index)
    handleInputChange('operational_details.timings', updatedTimings)
  }

  const toggleCourse = (courseId: string) => {
    const currentCourses = formData.assignments.courses
    const updatedCourses = currentCourses.includes(courseId)
      ? currentCourses.filter(id => id !== courseId)
      : [...currentCourses, courseId]
    
    handleInputChange('assignments.courses', updatedCourses)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader currentPage="Edit Branch" />
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
      <BranchManagerDashboardHeader currentPage="Edit Branch" />
      
      <main className="w-full p-4 lg:py-4 px-19">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/branch-manager-dashboard/branches/${branchId}`)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Branch Details</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Branch</h1>
                <p className="text-sm text-gray-500">Update branch information and settings</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch_name">Branch Name *</Label>
                    <Input
                      id="branch_name"
                      value={formData.branch.name}
                      onChange={(e) => handleInputChange('branch.name', e.target.value)}
                      className={errors['branch.name'] ? "border-red-500" : ""}
                      placeholder="Enter branch name"
                    />
                    {errors['branch.name'] && (
                      <p className="text-xs text-red-600">{errors['branch.name']}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch_code">Branch Code</Label>
                    <Input
                      id="branch_code"
                      value={formData.branch.code}
                      onChange={(e) => handleInputChange('branch.code', e.target.value)}
                      placeholder="Enter branch code"
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch_email">Email *</Label>
                    <Input
                      id="branch_email"
                      type="email"
                      value={formData.branch.email}
                      onChange={(e) => handleInputChange('branch.email', e.target.value)}
                      className={errors['branch.email'] ? "border-red-500" : ""}
                      placeholder="Enter email address"
                    />
                    {errors['branch.email'] && (
                      <p className="text-xs text-red-600">{errors['branch.email']}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch_phone">Phone *</Label>
                    <Input
                      id="branch_phone"
                      value={formData.branch.phone}
                      onChange={(e) => handleInputChange('branch.phone', e.target.value)}
                      className={errors['branch.phone'] ? "border-red-500" : ""}
                      placeholder="Enter phone number"
                    />
                    {errors['branch.phone'] && (
                      <p className="text-xs text-red-600">{errors['branch.phone']}</p>
                    )}
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
                  <Label htmlFor="address_line1">Address Line 1 *</Label>
                  <Input
                    id="address_line1"
                    value={formData.branch.address.line1}
                    onChange={(e) => handleInputChange('branch.address.line1', e.target.value)}
                    className={errors['branch.address.line1'] ? "border-red-500" : ""}
                    placeholder="Enter address line 1"
                  />
                  {errors['branch.address.line1'] && (
                    <p className="text-xs text-red-600">{errors['branch.address.line1']}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">Area</Label>
                    <Input
                      id="area"
                      value={formData.branch.address.area}
                      onChange={(e) => handleInputChange('branch.address.area', e.target.value)}
                      placeholder="Enter area"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.branch.address.city}
                      onChange={(e) => handleInputChange('branch.address.city', e.target.value)}
                      className={errors['branch.address.city'] ? "border-red-500" : ""}
                      placeholder="Enter city"
                    />
                    {errors['branch.address.city'] && (
                      <p className="text-xs text-red-600">{errors['branch.address.city']}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.branch.address.state}
                      onChange={(e) => handleInputChange('branch.address.state', e.target.value)}
                      className={errors['branch.address.state'] ? "border-red-500" : ""}
                      placeholder="Enter state"
                    />
                    {errors['branch.address.state'] && (
                      <p className="text-xs text-red-600">{errors['branch.address.state']}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={formData.branch.address.pincode}
                      onChange={(e) => handleInputChange('branch.address.pincode', e.target.value)}
                      className={errors['branch.address.pincode'] ? "border-red-500" : ""}
                      placeholder="Enter pincode"
                    />
                    {errors['branch.address.pincode'] && (
                      <p className="text-xs text-red-600">{errors['branch.address.pincode']}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/branch-manager-dashboard/branches/${branchId}`)}
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
                  'Update Branch'
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Branch Updated Successfully!</h3>
                  <p className="text-gray-600 mb-4">The branch information has been updated successfully.</p>
                  <Button
                    onClick={() => router.push(`/branch-manager-dashboard/branches/${branchId}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    View Branch Details
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
