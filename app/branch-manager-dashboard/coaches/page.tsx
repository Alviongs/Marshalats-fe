"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Edit, Trash2, RefreshCw, Eye, Star } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"

interface Coach {
  id: string
  full_name: string
  email: string
  phone: string
  specialization: string
  experience_years: number
  is_active: boolean
  branch_id: string
  created_at: string
  updated_at: string
  assigned_courses?: Array<{
    course_id: string
    course_name: string
    level: string
  }>
}

export default function BranchManagerCoachesList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [coachToDelete, setCoachToDelete] = useState<string | null>(null)

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

  // Load mock data for branch manager
  useEffect(() => {
    const loadCoachesData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Mock coaches data for branch manager
        const mockCoaches: Coach[] = [
          {
            id: "coach_001",
            full_name: "John Smith",
            email: "john@branch.com",
            phone: "+1234567890",
            specialization: "Martial Arts",
            experience_years: 5,
            is_active: true,
            branch_id: "branch_001",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            assigned_courses: [
              {
                course_id: "course_001",
                course_name: "Martial Arts Beginner",
                level: "Beginner"
              },
              {
                course_id: "course_002",
                course_name: "Martial Arts Intermediate",
                level: "Intermediate"
              }
            ]
          },
          {
            id: "coach_002",
            full_name: "Sarah Johnson",
            email: "sarah@branch.com",
            phone: "+1234567891",
            specialization: "Yoga",
            experience_years: 3,
            is_active: true,
            branch_id: "branch_001",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            assigned_courses: [
              {
                course_id: "course_003",
                course_name: "Yoga Beginner",
                level: "Beginner"
              }
            ]
          },
          {
            id: "coach_003",
            full_name: "Mike Davis",
            email: "mike@branch.com",
            phone: "+1234567892",
            specialization: "Dance",
            experience_years: 7,
            is_active: false,
            branch_id: "branch_001",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            assigned_courses: [
              {
                course_id: "course_004",
                course_name: "Dance Advanced",
                level: "Advanced"
              }
            ]
          }
        ]
        
        setCoaches(mockCoaches)
      } catch (err) {
        console.error('Error loading coaches data:', err)
        setError('Failed to load coaches data')
      } finally {
        setLoading(false)
      }
    }

    if (BranchManagerAuth.isAuthenticated()) {
      loadCoachesData()
    }
  }, [])

  // Filter coaches based on search term
  const filteredCoaches = coaches.filter(coach =>
    coach.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.phone.includes(searchTerm) ||
    coach.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredCoaches.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCoaches = filteredCoaches.slice(startIndex, endIndex)

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  const handleViewCoach = (coachId: string) => {
    router.push(`/branch-manager-dashboard/coaches/${coachId}`)
  }

  const handleEditCoach = (coachId: string) => {
    router.push(`/branch-manager-dashboard/coaches/edit/${coachId}`)
  }

  const handleDeleteCoach = (coachId: string) => {
    setCoachToDelete(coachId)
    setShowDeletePopup(true)
  }

  const confirmDelete = () => {
    if (coachToDelete) {
      setCoaches(coaches.filter(c => c.id !== coachToDelete))
      setCoachToDelete(null)
      setShowDeletePopup(false)
    }
  }

  const toggleCoachStatus = (coachId: string) => {
    setCoaches(coaches.map(coach =>
      coach.id === coachId
        ? { ...coach, is_active: !coach.is_active }
        : coach
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader currentPage="Masters" />
      
      <main className="w-full p-4 lg:py-4 px-19">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start py-8 mb-4 lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-medium text-gray-600">Branch Masters</h1>
            <p className="text-sm text-gray-500 mt-1">Manage coaches in your branch</p>
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
              onClick={() => router.push("/branch-manager-dashboard/add-coach")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Coach
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
                  placeholder="Search coaches by name, email, phone, or specialization..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coaches Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Coaches ({filteredCoaches.length})
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
            ) : currentCoaches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No coaches found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentCoaches.map((coach) => (
                  <div key={coach.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {coach.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900">{coach.full_name}</h3>
                        <p className="text-sm text-gray-500">{coach.email}</p>
                        <p className="text-xs text-gray-400">{coach.phone}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                          <span className="text-xs text-gray-500">
                            {coach.experience_years} years experience
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge variant={coach.is_active ? "default" : "secondary"}>
                          {coach.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {coach.specialization}
                        </p>
                        {coach.assigned_courses && coach.assigned_courses.length > 0 && (
                          <p className="text-xs text-blue-600 mt-1">
                            {coach.assigned_courses.length} course(s)
                          </p>
                        )}
                      </div>
                      
                      <Switch
                        checked={coach.is_active}
                        onCheckedChange={() => toggleCoachStatus(coach.id)}
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
                          <DropdownMenuItem onClick={() => handleViewCoach(coach.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCoach(coach.id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Coach
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCoach(coach.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Coach
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredCoaches.length)} of {filteredCoaches.length} coaches
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
              Are you sure you want to delete this coach? This action cannot be undone.
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
