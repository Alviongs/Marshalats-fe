"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Edit, Trash2, X, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"

interface Branch {
  id: string
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
  manager_id: string
  is_active?: boolean
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
  statistics?: {
    coach_count: number
    student_count: number
    course_count: number
    active_courses: number
  }
  created_at: string
  updated_at: string
}

export default function BranchManagerBranchInfo() {
  const router = useRouter()
  const [showAssignPopup, setShowAssignPopup] = useState(false)
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null)
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedCoach, setSelectedCoach] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // Modal states
  const [coaches, setCoaches] = useState<any[]>([])
  const [loadingCoaches, setLoadingCoaches] = useState(false)
  const [assignmentLoading, setAssignmentLoading] = useState(false)
  const [assignmentError, setAssignmentError] = useState<string | null>(null)
  
  // Add state for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Authentication check
  useEffect(() => {
    if (!BranchManagerAuth.isAuthenticated()) {
      router.replace('/branch-manager/login')
      return
    }
  }, [router])

  // Load branch data (for branch manager, this would be their specific branch)
  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const currentUser = BranchManagerAuth.getUser()
        if (!currentUser) {
          throw new Error("User data not found")
        }

        // Mock branch data for the branch manager's specific branch
        const mockBranch: Branch = {
          id: currentUser.branch_id || "branch_001",
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
              country: "Country"
            }
          },
          manager_id: currentUser.id,
          is_active: true,
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
          statistics: {
            coach_count: 8,
            student_count: 150,
            course_count: 12,
            active_courses: 10
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        setBranches([mockBranch])
      } catch (err) {
        console.error('Error loading branch data:', err)
        setError('Failed to load branch information')
      } finally {
        setLoading(false)
      }
    }

    if (BranchManagerAuth.isAuthenticated()) {
      fetchBranchData()
    }
  }, [])

  // Filter branches based on search term (for branch manager, this would be just their branch)
  const filteredBranches = branches.filter(branch =>
    branch.branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.branch.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBranches = filteredBranches.slice(startIndex, endIndex)

  const handleViewBranch = (branchId: string) => {
    router.push(`/branch-manager-dashboard/branches/${branchId}`)
  }

  const handleEditBranch = (branchId: string) => {
    router.push(`/branch-manager-dashboard/branches/edit/${branchId}`)
  }

  const toggleBranchStatus = (branchId: string) => {
    setBranches(branches.map(branch =>
      branch.id === branchId
        ? { ...branch, is_active: !branch.is_active }
        : branch
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader currentPage="Branch Info" />
      
      <main className="w-full p-4 lg:py-4 px-19">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start py-8 mb-4 lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-medium text-gray-600">Branch Information</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your branch details and settings</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:gap-3">
            <Button
              onClick={() => handleEditBranch(branches[0]?.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={branches.length === 0}
            >
              Edit Branch
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search branch information..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Branch Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Branch Details ({filteredBranches.length})
              </h2>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 1 }).map((_, index) => (
                  <div key={index} className="p-6 border border-gray-200 rounded-lg animate-pulse">
                    <div className="space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : currentBranches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No branch information found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {currentBranches.map((branch) => (
                  <div key={branch.id} className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{branch.branch.name}</h3>
                        <p className="text-sm text-gray-500">Code: {branch.branch.code}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={branch.is_active}
                          onCheckedChange={() => toggleBranchStatus(branch.id)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBranch(branch.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBranch(branch.id)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Contact Information */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Email: {branch.branch.email}</p>
                          <p>Phone: {branch.branch.phone}</p>
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Address</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>{branch.branch.address.line1}</p>
                          <p>{branch.branch.address.area}, {branch.branch.address.city}</p>
                          <p>{branch.branch.address.state} - {branch.branch.address.pincode}</p>
                          <p>{branch.branch.address.country}</p>
                        </div>
                      </div>

                      {/* Statistics */}
                      {branch.statistics && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Statistics</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>Students: {branch.statistics.student_count}</p>
                            <p>Coaches: {branch.statistics.coach_count}</p>
                            <p>Courses: {branch.statistics.course_count}</p>
                            <p>Active Courses: {branch.statistics.active_courses}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Operational Details */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3">Operational Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Courses Offered</h5>
                          <div className="flex flex-wrap gap-2">
                            {branch.operational_details.courses_offered.map((course, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {course}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Operating Hours</h5>
                          <div className="space-y-1 text-xs text-gray-600">
                            {branch.operational_details.timings.slice(0, 3).map((timing, index) => (
                              <p key={index}>{timing.day}: {timing.open} - {timing.close}</p>
                            ))}
                            {branch.operational_details.timings.length > 3 && (
                              <p className="text-blue-600">+{branch.operational_details.timings.length - 3} more days</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
