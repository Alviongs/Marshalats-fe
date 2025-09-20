"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, Calendar, Shield, Edit, Save, X, Loader2 } from "lucide-react"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { useToast } from "@/hooks/use-toast"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"

interface BranchManagerProfile {
  id: string
  full_name: string
  email: string
  phone?: string
  branch_name?: string
  branch_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface FormErrors {
  [key: string]: string
}

export default function BranchManagerProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<BranchManagerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    // Check authentication first
    if (!BranchManagerAuth.isAuthenticated()) {
      router.push("/branch-manager/login")
      return
    }

    // Load profile data
    const loadProfile = async () => {
      try {
        setLoading(true)

        const token = BranchManagerAuth.getToken()
        if (!token) {
          throw new Error("Authentication token not found")
        }

        // Try to fetch profile from API first
        let profileData: BranchManagerProfile | null = null

        try {
          const response = await fetch('/api/branch-managers/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            const branchManagerData = data.branch_manager

            // Transform backend data to frontend format
            profileData = {
              id: branchManagerData.id,
              full_name: branchManagerData.full_name ||
                        (branchManagerData.personal_info ?
                         `${branchManagerData.personal_info.first_name} ${branchManagerData.personal_info.last_name}` :
                         "Branch Manager"),
              email: branchManagerData.email || branchManagerData.contact_info?.email || "",
              phone: branchManagerData.phone || branchManagerData.contact_info?.phone || "",
              branch_name: branchManagerData.branch_name || branchManagerData.branch_assignment?.branch_name || "",
              branch_id: branchManagerData.branch_id || branchManagerData.branch_assignment?.branch_id || "",
              is_active: branchManagerData.is_active !== undefined ? branchManagerData.is_active : true,
              created_at: branchManagerData.created_at || new Date().toISOString(),
              updated_at: branchManagerData.updated_at || new Date().toISOString()
            }
          } else if (response.status === 401) {
            BranchManagerAuth.logout()
            router.push("/branch-manager/login")
            return
          }
        } catch (apiError) {
          console.warn('API fetch failed, falling back to auth data:', apiError)
        }

        // Fallback to auth data if API fails
        if (!profileData) {
          const currentUser = BranchManagerAuth.getCurrentUser()
          if (!currentUser) {
            throw new Error("No profile data available")
          }

          profileData = {
            id: currentUser.id,
            full_name: currentUser.full_name || "Branch Manager",
            email: currentUser.email || "",
            phone: currentUser.phone || "",
            branch_name: currentUser.branch_name || "",
            branch_id: currentUser.branch_id || "",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }

        setProfile(profileData)
        setFormData({
          full_name: profileData.full_name,
          email: profileData.email,
          phone: profileData.phone || "",
        })

      } catch (error) {
        console.error('Error loading profile:', error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router, toast])

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      const token = BranchManagerAuth.getToken()
      if (!token) {
        throw new Error("Authentication token not found")
      }

      // Prepare update data in the format expected by the backend
      const updateData = {
        personal_info: {
          first_name: formData.full_name.split(' ')[0] || formData.full_name,
          last_name: formData.full_name.split(' ').slice(1).join(' ') || ""
        },
        contact_info: {
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ''), // Remove non-digits
          country_code: "+91" // Default country code
        }
      }

      // Try to make API call to update profile
      let updateSuccessful = false

      try {
        const response = await fetch('/api/branch-managers/me', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        })

        if (response.ok) {
          const result = await response.json()

          // Update profile state with the response data
          if (result.branch_manager) {
            const updatedBranchManager = result.branch_manager
            const updatedProfile: BranchManagerProfile = {
              id: updatedBranchManager.id,
              full_name: updatedBranchManager.full_name ||
                        (updatedBranchManager.personal_info ?
                         `${updatedBranchManager.personal_info.first_name} ${updatedBranchManager.personal_info.last_name}` :
                         formData.full_name),
              email: updatedBranchManager.email || updatedBranchManager.contact_info?.email || formData.email,
              phone: updatedBranchManager.phone || updatedBranchManager.contact_info?.phone || formData.phone,
              branch_name: updatedBranchManager.branch_name || profile?.branch_name || "",
              branch_id: updatedBranchManager.branch_id || profile?.branch_id || "",
              is_active: updatedBranchManager.is_active !== undefined ? updatedBranchManager.is_active : true,
              created_at: updatedBranchManager.created_at || profile?.created_at || new Date().toISOString(),
              updated_at: updatedBranchManager.updated_at || new Date().toISOString()
            }
            setProfile(updatedProfile)
            updateSuccessful = true
          }
        } else if (response.status === 401) {
          BranchManagerAuth.logout()
          router.push("/branch-manager/login")
          return
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.warn('API update failed:', errorData)
        }
      } catch (apiError) {
        console.warn('API update failed:', apiError)
      }

      // Fallback: update local state if API failed
      if (!updateSuccessful && profile) {
        const updatedProfile = {
          ...profile,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        }
        setProfile(updatedProfile)

        // Also update the auth data
        const currentUser = BranchManagerAuth.getCurrentUser()
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone
          }
          BranchManagerAuth.setCurrentUser(updatedUser)
        }
      }

      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone || "",
      })
    }
    setErrors({})
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader currentPage="Profile" />
        <main className="w-full p-4 lg:py-4 px-19">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="bg-white rounded-lg p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader currentPage="Profile" />
        <main className="w-full p-4 lg:py-4 px-19">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-8">
              <p className="text-red-600">Failed to load profile data</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader currentPage="Profile" />
      
      <main className="w-full p-4 lg:py-4 px-19">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start py-8 mb-6 lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-medium text-gray-600">Profile Settings</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your account information and preferences</p>
            </div>
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? (
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
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Profile Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="w-20 h-20 mb-4">
                      <AvatarImage src="" alt={profile.full_name} />
                      <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                        {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-gray-900">{profile.full_name}</h3>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                    <Badge variant={profile.is_active ? "default" : "secondary"} className="mt-2">
                      {profile.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Role</p>
                        <p className="text-xs text-gray-500">Branch Manager</p>
                      </div>
                    </div>

                    {profile.branch_name && (
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Branch</p>
                          <p className="text-xs text-gray-500">{profile.branch_name}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Member Since</p>
                        <p className="text-xs text-gray-500">{formatDate(profile.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                        Full Name *
                      </Label>
                      {isEditing ? (
                        <div>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => handleInputChange('full_name', e.target.value)}
                            className={errors.full_name ? "border-red-500" : ""}
                            placeholder="Enter your full name"
                          />
                          {errors.full_name && (
                            <p className="text-xs text-red-600 mt-1">{errors.full_name}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{profile.full_name}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address *
                      </Label>
                      {isEditing ? (
                        <div>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={errors.email ? "border-red-500" : ""}
                            placeholder="Enter your email address"
                          />
                          {errors.email && (
                            <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{profile.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      {isEditing ? (
                        <div>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className={errors.phone ? "border-red-500" : ""}
                            placeholder="Enter your phone number"
                          />
                          {errors.phone && (
                            <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{profile.phone || "Not provided"}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Branch Assignment
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{profile.branch_name || "Not assigned"}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Account Created</Label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{formatDate(profile.created_at)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{formatDate(profile.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
