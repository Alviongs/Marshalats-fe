"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRegistration } from "@/contexts/RegistrationContext"
import { useToast } from "@/hooks/use-toast"

interface Branch {
  id: string
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
  courses_offered: string[]
  timings: Array<{
    day: string
    open: string
    close: string
  }>
}

export default function SelectBranchPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { registrationData, updateRegistrationData } = useRegistration()

  // State management
  const [selectedLocation, setSelectedLocation] = useState("")
  const [branch_id, setBranchId] = useState(registrationData.branch_id || "")
  const [branches, setBranches] = useState<Branch[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)
  const [isLoadingLocations, setIsLoadingLocations] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoadingLocations(true)
        setError(null)

        const response = await fetch('http://localhost:8003/api/locations/public/details?active_only=true')

        if (!response.ok) {
          throw new Error('Failed to fetch locations')
        }

        const data = await response.json()
        setLocations(data.locations || [])

        console.log(`Loaded ${data.locations?.length || 0} locations`)

      } catch (err) {
        console.error('Error fetching locations:', err)
        setError('Failed to load locations. Please try again.')
        toast({
          title: "Error",
          description: "Failed to load locations. Please check your connection and try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingLocations(false)
      }
    }

    fetchLocations()
  }, [])

  // Load branches when location is selected
  useEffect(() => {
    const loadBranchesForLocation = async () => {
      if (!selectedLocation) {
        setBranches([])
        return
      }

      try {
        setIsLoadingBranches(true)
        setError(null)

        const response = await fetch(`http://localhost:8003/api/branches/public/by-location/${selectedLocation}?active_only=true`)

        if (!response.ok) {
          throw new Error('Failed to fetch branches for location')
        }

        const data = await response.json()
        setBranches(data.branches || [])

        console.log(`Loaded ${data.branches?.length || 0} branches for location`)

      } catch (err) {
        console.error('Error fetching branches for location:', err)
        setError('Failed to load branches for selected location.')
        setBranches([])
        toast({
          title: "Error",
          description: "Failed to load branches for selected location. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingBranches(false)
      }
    }

    loadBranchesForLocation()
  }, [selectedLocation])

  // Clear branch selection when location changes
  useEffect(() => {
    if (branch_id && selectedLocation) {
      // Check if current branch is still valid for the selected location
      const branchExists = branches.find(branch => branch.id === branch_id)
      if (!branchExists) {
        setBranchId("")
      }
    }
  }, [branches, branch_id, selectedLocation])

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleContinue()
  }

  const handleContinue = () => {
    if (!branch_id) {
      toast({
        title: "Branch Required",
        description: "Please select a branch to continue.",
        variant: "destructive",
      })
      return
    }

    // Find the selected branch to get additional details
    const selectedBranch = branches.find(branch => branch.id === branch_id)

    // Save branch selection data to context
    updateRegistrationData({
      branch_id,
      selected_location: selectedLocation,
      branch_details: selectedBranch ? {
        name: selectedBranch.name,
        address: selectedBranch.address
      } : null
    })

    router.push("/register/payment")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-200 items-center justify-center relative overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/select-branch-left.png')",
          }}
        />
      </div>

      {/* Right Side - Branch Selection Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-black">Branch Details</h1>
            <p className="text-gray-500 text-sm">Select your preferred location and branch to continue.</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Branch Selection Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Location */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <Select
                value={selectedLocation}
                onValueChange={(value) => setSelectedLocation(value)}
                disabled={isLoadingLocations}
              >
                <SelectTrigger className="!w-full !h-14 !pl-12 !pr-4 !py-4 !text-base !bg-gray-50 !border-gray-200 !rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent !min-h-14">
                  <SelectValue placeholder={isLoadingLocations ? "Loading locations..." : "Select Location"} className="text-gray-500" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-gray-200 bg-white shadow-lg max-h-60">
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id} className="!py-3 !pl-3 pr-8 text-base hover:bg-gray-50 rounded-lg cursor-pointer">
                      {location.name} ({location.state})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Select Branch */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <Select
                value={branch_id}
                onValueChange={(value) => setBranchId(value)}
                disabled={!selectedLocation || isLoadingBranches}
              >
                <SelectTrigger className="!w-full !h-14 !pl-12 !pr-4 !py-4 !text-base !bg-gray-50 !border-gray-200 !rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent !min-h-14">
                  <SelectValue placeholder={
                    !selectedLocation
                      ? "Select location first"
                      : isLoadingBranches
                        ? "Loading branches..."
                        : branches.length === 0
                          ? "No branches available"
                          : "Select Branch"
                  } className="text-gray-500" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-gray-200 bg-white shadow-lg max-h-60">
                  {branches.length > 0 ? (
                    branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id} className="!py-3 !pl-3 pr-8 text-base hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="flex flex-col">
                          <span className="font-medium">{branch.name}</span>
                          <span className="text-xs text-gray-500">
                            {branch.address.city}, {branch.address.state}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">
                        {!selectedLocation
                          ? "Please select a location first"
                          : isLoadingBranches
                            ? "Loading branches..."
                            : "No branches available for selected location"
                        }
                      </p>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Next Step Button */}
            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-6 rounded-xl text-lg h-14 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl mt-8"
            >
              NEXT STEP
            </Button>
          </form>

          {/* Step Indicator */}
          <div className="text-center py-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">1</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">2</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">4</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">5</div>
            </div>
            <span className="text-gray-500 text-sm font-medium">Step 3 of 5 - Branch Selection</span>
          </div>

          {/* Social Login */}
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <span className="text-gray-700 font-semibold">Register with Others</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-3 py-4 px-4 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white rounded-xl transition-all duration-200 h-12"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium">Google</span>
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-center space-x-3 py-4 px-4 border-2 border-blue-200 hover:border-blue-300 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 h-12"
              >
                <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">f</span>
                </div>
                <span className="text-sm font-medium">Facebook</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
