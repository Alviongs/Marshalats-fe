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
import { User, Mail, Phone, Calendar, Shield, Edit, Save, X } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import { useToast } from "@/hooks/use-toast"
import { TokenManager } from "@/lib/tokenManager"

interface SuperAdminProfile {
  id: string
  full_name: string
  email: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface FormErrors {
  [key: string]: string
}

export default function SuperAdminProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<SuperAdminProfile | null>(null)
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
    if (!TokenManager.isAuthenticated()) {
      router.push("/superadmin/login")
      return
    }

    // Check if user is superadmin
    const user = TokenManager.getUser()
    if (!user || user.role !== "superadmin") {
      router.push("/superadmin/login")
      return
    }

    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        router.push("/superadmin/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.status === "success" && result.data) {
          setProfile(result.data)
          setFormData({
            full_name: result.data.full_name || "",
            email: result.data.email || "",
            phone: result.data.phone || "",
          })
        }
      } else if (response.status === 401) {
        router.push("/superadmin/login")
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const token = TokenManager.getToken()
      if (!token) {
        router.push("/superadmin/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.status === "success" && result.data) {
          // Update the profile state with the new data
          setProfile(result.data)
          setIsEditing(false)

          toast({
            title: "Success",
            description: "Profile updated successfully",
            variant: "default"
          })
        }
      } else if (response.status === 401) {
        router.push("/superadmin/login")
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.detail || "Failed to update profile",
          variant: "destructive"
        })
      }

    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
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
        <DashboardHeader currentPage="Profile" />
        <main className="w-full p-4 lg:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader currentPage="Profile" />
      
      <main className="w-full p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Manage your superadmin account information</p>
            </div>
            
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-yellow-100 text-yellow-800 text-lg font-semibold">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'SA'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-900">{profile?.full_name}</h2>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Super Admin
                    </Badge>
                  </div>
                  <p className="text-gray-600">{profile?.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                    </span>
                    <Badge variant={profile?.is_active ? "default" : "secondary"} className="text-xs">
                      {profile?.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                        Full Name *
                      </Label>
                      {isEditing ? (
                        <div className="mt-1">
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => handleInputChange("full_name", e.target.value)}
                            className={errors.full_name ? "border-red-500" : ""}
                            placeholder="Enter your full name"
                          />
                          {errors.full_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                          )}
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                          {profile?.full_name || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address *
                      </Label>
                      {isEditing ? (
                        <div className="mt-1">
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className={errors.email ? "border-red-500" : ""}
                            placeholder="Enter your email address"
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                          )}
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          {profile?.email || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      {isEditing ? (
                        <div className="mt-1">
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className={errors.phone ? "border-red-500" : ""}
                            placeholder="Enter your phone number"
                          />
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                          )}
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          {profile?.phone || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Account Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Account ID</Label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md font-mono">
                        {profile?.id || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Account Status</Label>
                      <div className="mt-1">
                        <Badge
                          variant={profile?.is_active ? "default" : "secondary"}
                          className={profile?.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {profile?.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Created At</Label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                        {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                        {profile?.updated_at ? formatDate(profile.updated_at) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </main>
    </div>
  )
}
