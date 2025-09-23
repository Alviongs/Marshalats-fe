"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  Building, 
  Save,
  X,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react"
import CoachDashboardHeader from "@/components/coach-dashboard-header"
import { checkCoachAuth } from "@/lib/coachAuth"

interface CoachProfile {
  id: string
  full_name: string
  personal_info?: {
    first_name: string
    last_name: string
    gender?: string
    date_of_birth?: string
  }
  contact_info?: {
    email: string
    phone?: string
    country_code?: string
  }
  address_info?: {
    address?: string
    area?: string
    city?: string
    state?: string
    zip_code?: string
    country?: string
  }
  professional_info?: {
    specialization?: string
    years_of_experience?: string
    education_qualification?: string
    certifications?: string[]
    bio?: string
  }
  areas_of_expertise?: string[]
  branch_id?: string
  branch_name?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function CoachProfileEditPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<CoachProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    area: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    specialization: "",
    experience: "",
    qualifications: "",
    certifications: "",
    bio: "",
    areasOfExpertise: [] as string[]
  })

  const genderOptions = ["male", "female", "other"]
  const experienceOptions = [
    "0-1 years",
    "1-3 years", 
    "3-5 years",
    "5-10 years",
    "10+ years"
  ]

  const availableSpecializations = [
    "Karate",
    "Taekwondo", 
    "Judo",
    "Boxing",
    "Kickboxing",
    "Mixed Martial Arts",
    "Self Defense",
    "Aikido",
    "Kung Fu",
    "Muay Thai"
  ]

  useEffect(() => {
    // Use the robust coach authentication check
    const authResult = checkCoachAuth()

    if (!authResult.isAuthenticated) {
      console.log("Coach not authenticated:", authResult.error)
      router.push("/coach/login")
      return
    }

    if (authResult.coach) {
      setProfile(authResult.coach)
      populateFormData(authResult.coach)
      setLoading(false)
    } else {
      setError("Profile information not found")
      setLoading(false)
    }
  }, [router])

  const populateFormData = (profileData: CoachProfile) => {
    setFormData({
      firstName: profileData.personal_info?.first_name || "",
      lastName: profileData.personal_info?.last_name || "",
      email: profileData.contact_info?.email || "",
      phone: profileData.contact_info?.phone || "",
      password: "", // Always empty for security
      gender: profileData.personal_info?.gender || "",
      dateOfBirth: profileData.personal_info?.date_of_birth?.split('T')[0] || "",
      address: profileData.address_info?.address || "",
      area: profileData.address_info?.area || "",
      city: profileData.address_info?.city || "",
      state: profileData.address_info?.state || "",
      zipCode: profileData.address_info?.zip_code || "",
      country: profileData.address_info?.country || "India",
      specialization: profileData.professional_info?.specialization || "",
      experience: profileData.professional_info?.years_of_experience || "",
      qualifications: profileData.professional_info?.education_qualification || "",
      certifications: (profileData.professional_info?.certifications || []).join(', '),
      bio: profileData.professional_info?.bio || "",
      areasOfExpertise: profileData.areas_of_expertise || []
    })
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Personal info validation
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.gender) newErrors.gender = "Gender is required"
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"

    // Contact info validation
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"

    // Address info validation
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required"

    // Professional info validation
    if (!formData.specialization.trim()) newErrors.specialization = "Specialization is required"
    if (!formData.experience.trim()) newErrors.experience = "Experience is required"
    if (!formData.qualifications.trim()) newErrors.qualifications = "Qualifications are required"

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation (basic)
    const phoneRegex = /^[0-9]{10}$/
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
    }

    // Password validation (only if provided)
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    if (!profile) {
      toast({
        title: "Error",
        description: "Profile data not available",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      // Prepare coach data for update
      const updateData = {
        personal_info: {
          first_name: formData.firstName || "Unknown",
          last_name: formData.lastName || "User",
          gender: formData.gender || "other",
          date_of_birth: formData.dateOfBirth || "1990-01-01"
        },
        contact_info: {
          email: formData.email || "unknown@example.com",
          country_code: "+91",
          phone: formData.phone || "0000000000",
          ...(formData.password.trim() && { password: formData.password })
        },
        address_info: {
          address: formData.address || "Not provided",
          area: formData.area || formData.city || "Not provided",
          city: formData.city || "Not provided",
          state: formData.state || "Not provided",
          zip_code: formData.zipCode || "000000",
          country: formData.country || "India"
        },
        professional_info: {
          designation_id: formData.specialization || "general",
          professional_experience: formData.experience || "0-1 years",
          education_qualification: formData.qualifications || "Not provided",
          certifications: formData.certifications ? formData.certifications.split(',').map(cert => cert.trim()).filter(cert => cert) : []
        },
        areas_of_expertise: formData.areasOfExpertise
      }

      console.log("Updating coach profile with data:", updateData)
      console.log("Update data structure:", JSON.stringify(updateData, null, 2))

      // Get coach token from localStorage using the correct key
      const coachToken = localStorage.getItem("access_token") ||
                        localStorage.getItem("token") ||
                        localStorage.getItem("coachToken")
      if (!coachToken) {
        throw new Error("Authentication token not found. Please login again.")
      }

      // Use the local API route that proxies to backend
      const response = await fetch('/api/coaches/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${coachToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error("API Error Details:", errorData)
        throw new Error(errorData.detail || errorData.error || errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Profile update successful:", result)

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      // Redirect back to profile page
      router.push("/coach-dashboard/profile")

    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push("/coach-dashboard/profile")
  }

  const handleSpecializationToggle = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      areasOfExpertise: prev.areasOfExpertise.includes(specialization)
        ? prev.areasOfExpertise.filter(s => s !== specialization)
        : [...prev.areasOfExpertise, specialization]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Edit Profile"
          coachName={profile?.full_name}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
              <span className="ml-2 text-gray-600">Loading profile...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Edit Profile"
          coachName="Coach"
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-red-600">
                  <p className="font-medium">Error loading profile</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachDashboardHeader 
        currentPage="Edit Profile"
        coachName={profile.full_name}
      />
      
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Page Header - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="self-start sm:self-auto w-fit"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Profile</h1>
                <p className="text-sm sm:text-base text-gray-600">Update your profile information</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Personal Information */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Enter first name"
                      className={`h-11 ${errors.firstName ? "border-red-500" : ""}`}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs sm:text-sm">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Enter last name"
                      className={`h-11 ${errors.lastName ? "border-red-500" : ""}`}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs sm:text-sm">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger className={`h-11 ${errors.gender ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map((gender) => (
                          <SelectItem key={gender} value={gender} className="py-3">
                            {gender.charAt(0).toUpperCase() + gender.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-red-500 text-xs sm:text-sm">{errors.gender}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                      className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs sm:text-sm">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                      className={`h-11 ${errors.phone ? "border-red-500" : ""}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs sm:text-sm">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password (Leave blank to keep current password)</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter new password (optional)"
                      className={`h-11 pr-12 ${errors.password ? "border-red-500" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 w-11 px-0 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs sm:text-sm">{errors.password}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Address Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter street address"
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="area" className="text-sm font-medium">Area</Label>
                    <Input
                      id="area"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="Enter area/locality"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Enter city"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Enter state"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-sm font-medium">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="Enter ZIP code"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Enter country"
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Professional Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="specialization" className="text-sm font-medium">Primary Specialization</Label>
                    <Select
                      value={formData.specialization}
                      onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSpecializations.map((spec) => (
                          <SelectItem key={spec} value={spec} className="py-3">
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-sm font-medium">Years of Experience</Label>
                    <Select
                      value={formData.experience}
                      onValueChange={(value) => setFormData({ ...formData, experience: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceOptions.map((exp) => (
                          <SelectItem key={exp} value={exp} className="py-3">
                            {exp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualifications" className="text-sm font-medium">Education Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    placeholder="Enter your educational qualifications"
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications" className="text-sm font-medium">Certifications (comma-separated)</Label>
                  <Textarea
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    placeholder="Enter your certifications, separated by commas"
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about your professional background and experience"
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Areas of Expertise</Label>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {availableSpecializations.map((specialization) => (
                      <Badge
                        key={specialization}
                        variant={formData.areasOfExpertise.includes(specialization) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-yellow-100 hover:text-yellow-800 transition-colors duration-200 px-3 py-2 text-xs sm:text-sm touch-manipulation"
                        onClick={() => handleSpecializationToggle(specialization)}
                      >
                        {specialization}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">Tap to select/deselect areas of expertise</p>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 sm:pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="w-full sm:w-auto h-11 order-2 sm:order-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto h-11 bg-yellow-600 hover:bg-yellow-700 order-1 sm:order-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
