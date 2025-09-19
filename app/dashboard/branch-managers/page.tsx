"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Trash2, ToggleLeft, ToggleRight, Eye, Mail, Loader2, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/dashboard-header"
import { TokenManager } from "@/lib/tokenManager"
import { useToast } from "@/hooks/use-toast"

interface BranchManager {
  id: string
  personal_info: {
    first_name: string
    last_name: string
    gender: string
    date_of_birth: string
  }
  contact_info: {
    email: string
    phone: string
  }
  professional_info: {
    designation: string
    education_qualification: string
    professional_experience: string
    certifications: string[]
  }
  branch_assignment: {
    branch_id: string
    branch_name: string
  }
  full_name: string
  is_active: boolean
  created_at: string
}

export default function BranchManagersListPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [showSendCredentialsPopup, setShowSendCredentialsPopup] = useState(false)
  const [selectedManager, setSelectedManager] = useState<string | null>(null)
  const [selectedManagerForCredentials, setSelectedManagerForCredentials] = useState<BranchManager | null>(null)
  const [isSendingCredentials, setIsSendingCredentials] = useState(false)
  const [branchManagers, setBranchManagers] = useState<BranchManager[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Fetch branch managers from API
  useEffect(() => {
    const fetchBranchManagers = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = TokenManager.getToken()
        if (!token) {
          throw new Error("Authentication token not found. Please login again.")
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/branch-managers`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || errorData.message || `Failed to fetch branch managers (${response.status})`)
        }

        const data = await response.json()
        console.log("Branch managers fetched successfully:", data)

        // Handle different response formats
        const managersData = data.branch_managers || data || []
        setBranchManagers(managersData)

      } catch (error) {
        console.error("Error fetching branch managers:", error)
        setError(error instanceof Error ? error.message : 'Failed to fetch branch managers')
      } finally {
        setLoading(false)
      }
    }

    fetchBranchManagers()
  }, [])

  const handleDeleteClick = (managerId: string) => {
    setSelectedManager(managerId)
    setShowDeletePopup(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedManager !== null) {
      try {
        const token = TokenManager.getToken()
        if (!token) {
          throw new Error("Authentication token not found. Please login again.")
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/branch-managers/${selectedManager}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || errorData.message || `Failed to delete branch manager (${response.status})`)
        }

        // Remove manager from local state
        setBranchManagers(branchManagers.filter(manager => manager.id !== selectedManager))
        setShowDeletePopup(false)
        setSelectedManager(null)

        toast({
          title: "Success",
          description: "Branch manager deleted successfully",
        })

      } catch (error) {
        console.error("Error deleting branch manager:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : 'Failed to delete branch manager',
          variant: "destructive",
        })
      }
    }
  }

  const handleSendCredentials = (manager: BranchManager) => {
    setSelectedManagerForCredentials(manager)
    setShowSendCredentialsPopup(true)
  }

  const handleSendCredentialsConfirm = async () => {
    if (!selectedManagerForCredentials) return

    try {
      setIsSendingCredentials(true)

      const token = TokenManager.getToken()
      if (!token) {
        throw new Error("Authentication token not found. Please login again.")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/branch-managers/${selectedManagerForCredentials.id}/send-credentials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || errorData.message || `Failed to send credentials (${response.status})`)
      }

      toast({
        title: "Success",
        description: "Credentials sent successfully to branch manager's email",
      })

      setShowSendCredentialsPopup(false)
      setSelectedManagerForCredentials(null)

    } catch (error) {
      console.error("Error sending credentials:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to send credentials',
        variant: "destructive",
      })
    } finally {
      setIsSendingCredentials(false)
    }
  }

  const toggleManagerStatus = async (managerId: string, currentStatus: boolean) => {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new Error("Authentication token not found. Please login again.")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/branch-managers/${managerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_active: !currentStatus
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || errorData.message || `Failed to update status (${response.status})`)
      }

      // Update local state
      setBranchManagers(branchManagers.map(manager => 
        manager.id === managerId 
          ? { ...manager, is_active: !currentStatus }
          : manager
      ))

      toast({
        title: "Success",
        description: `Branch manager ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      })

    } catch (error) {
      console.error("Error updating manager status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: "destructive",
      })
    }
  }

  // Filter managers based on search term
  const filteredManagers = branchManagers.filter(manager =>
    manager.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.contact_info.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.branch_assignment?.branch_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredManagers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentManagers = filteredManagers.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader currentPage="Branch Managers" />
        <main className="w-full p-4 lg:py-4 px-19">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="bg-white rounded-lg p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader currentPage="Branch Managers" />
      
      <main className="w-full p-4 lg:py-4 px-19">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Branch Managers</h1>
              <p className="text-gray-600">Manage branch managers and their assignments</p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/branch-managers/create")}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Branch Manager
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, email, or branch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      <SelectItem value="branch1">Branch 1</SelectItem>
                      <SelectItem value="branch2">Branch 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error State */}
          {error && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center text-red-600">
                  <p>{error}</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="mt-4"
                    variant="outline"
                  >
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Branch Managers List */}
          <Card>
            <CardContent className="p-0">
              {currentManagers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No branch managers found</p>
                  <Button
                    onClick={() => router.push("/dashboard/branch-managers/create")}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Branch Manager
                  </Button>
                </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-medium text-sm text-gray-700">
                    <div className="col-span-3">Manager</div>
                    <div className="col-span-2">Branch</div>
                    <div className="col-span-2">Contact</div>
                    <div className="col-span-2">Designation</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200">
                    {currentManagers.map((manager) => (
                      <div key={manager.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors">
                        <div className="col-span-3 flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>
                              {manager.personal_info.first_name[0]}{manager.personal_info.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{manager.full_name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(manager.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="col-span-2 flex items-center">
                          <div>
                            <p className="font-medium text-gray-900">
                              {manager.branch_assignment?.branch_name || 'Unassigned'}
                            </p>
                            <p className="text-sm text-gray-500">Branch Manager</p>
                          </div>
                        </div>
                        
                        <div className="col-span-2 flex items-center">
                          <div>
                            <p className="text-sm text-gray-900">{manager.contact_info.email}</p>
                            <p className="text-sm text-gray-500">{manager.contact_info.phone}</p>
                          </div>
                        </div>
                        
                        <div className="col-span-2 flex items-center">
                          <p className="text-sm text-gray-900">
                            {manager.professional_info.designation || 'Branch Manager'}
                          </p>
                        </div>
                        
                        <div className="col-span-1 flex items-center">
                          <Badge variant={manager.is_active ? "default" : "secondary"}>
                            {manager.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <div className="col-span-2 flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/dashboard/branch-managers/${manager.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/branch-managers/edit/${manager.id}`)}
                              >
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSendCredentials(manager)}
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Send Credentials
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleManagerStatus(manager.id, manager.is_active)}
                              >
                                {manager.is_active ? (
                                  <>
                                    <ToggleLeft className="w-4 h-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight className="w-4 h-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(manager.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              
              {Array.from({ length: totalPages }).map((_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  size="sm"
                  className={currentPage === index + 1 ? "bg-yellow-400 text-black hover:bg-yellow-500" : ""}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Branch Manager</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this branch manager? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeletePopup(false)
                  setSelectedManager(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Send Credentials Popup */}
      {showSendCredentialsPopup && selectedManagerForCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Login Credentials</h3>
            <p className="text-gray-600 mb-6">
              Send login credentials to <strong>{selectedManagerForCredentials.full_name}</strong> at{" "}
              <strong>{selectedManagerForCredentials.contact_info.email}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSendCredentialsPopup(false)
                  setSelectedManagerForCredentials(null)
                }}
                disabled={isSendingCredentials}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendCredentialsConfirm}
                disabled={isSendingCredentials}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSendingCredentials ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Credentials'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
