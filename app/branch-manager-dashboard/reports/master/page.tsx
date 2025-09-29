"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Filter, 
  Loader2,
  AlertCircle,
  Users,
  BookOpen,
  MapPin,
  Award,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { reportsAPI, MasterReportsResponse, MasterReportFiltersResponse, MasterData } from "@/lib/reportsAPI"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/usePerformance"

interface FilterState {
  branch_id: string
  course_id: string
  area_of_expertise: string
  professional_experience: string
  designation_id: string
  active_only: boolean
  search: string
}

export default function BranchManagerMasterReportPage() {
  const router = useRouter()
  
  // State management
  const [loading, setLoading] = useState(false)
  const [filtersLoading, setFiltersLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [masters, setMasters] = useState<MasterData[]>([])
  const [filterOptions, setFilterOptions] = useState<MasterReportFiltersResponse | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    skip: 0,
    limit: 50,
    has_more: false
  })
  
  // Get current branch manager data for filtering
  const currentBranchManager = BranchManagerAuth.getCurrentUser()
  const branchManagerBranchId = currentBranchManager?.branch_id

  // Filter states - automatically set branch_id to current branch manager's branch
  const [filters, setFilters] = useState<FilterState>({
    branch_id: branchManagerBranchId || "",
    course_id: "",
    area_of_expertise: "",
    professional_experience: "",
    designation_id: "",
    active_only: true,
    search: ""
  })

  // Search state for debouncing
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearchTerm = useDebounce(searchInput, 500)

  // Update filters when debounced search term changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearchTerm }))
  }, [debouncedSearchTerm])

  // Update branch_id filter when branch manager data is available
  useEffect(() => {
    if (branchManagerBranchId) {
      setFilters(prev => ({ ...prev, branch_id: branchManagerBranchId }))
    }
  }, [branchManagerBranchId])

  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions()
  }, [])

  // Load master reports when filters change
  useEffect(() => {
    loadMasterReports(true) // Reset pagination when filters change
  }, [filters.branch_id, filters.course_id, filters.area_of_expertise, filters.professional_experience, filters.designation_id, filters.active_only, filters.search])

  // Load filter options
  const loadFilterOptions = async () => {
    const token = BranchManagerAuth.getToken()
    if (!token) {
      toast.error("Authentication required. Please login again.")
      router.push("/branch-manager/login")
      return
    }

    setFiltersLoading(true)
    try {
      const response = await reportsAPI.getMasterReportFilters(token)
      setFilterOptions(response)
    } catch (error) {
      console.error('Error loading filter options:', error)
      toast.error('Failed to load filter options')
    } finally {
      setFiltersLoading(false)
    }
  }

  // Load master reports data
  const loadMasterReports = async (resetPagination = false) => {
    const token = BranchManagerAuth.getToken()
    if (!token) {
      toast.error("Authentication required. Please login again.")
      router.push("/branch-manager/login")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const skip = resetPagination ? 0 : pagination.skip
      const response = await reportsAPI.getMasterReports(token, {
        ...filters,
        skip,
        limit: pagination.limit
      })
      
      setMasters(response.masters)
      setPagination({
        total: response.pagination.total,
        skip: response.pagination.skip,
        limit: response.pagination.limit,
        has_more: response.pagination.has_more
      })
      
      if (resetPagination) {
        setPagination(prev => ({ ...prev, skip: 0 }))
      }
    } catch (error) {
      console.error('Error loading master reports:', error)
      setError('Failed to load master reports')
      toast.error('Failed to load master reports')
    } finally {
      setLoading(false)
    }
  }

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    // Prevent changing branch_id for branch managers
    if (key === 'branch_id' && branchManagerBranchId) {
      return
    }
    
    // Convert "all" to empty string for API calls
    const processedValue = typeof value === 'string' && value === 'all' ? '' : value
    setFilters(prev => ({ ...prev, [key]: processedValue }))
  }

  // Handle search input
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  // Handle pagination
  const handleLoadMore = () => {
    if (pagination.has_more && !loading) {
      setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }))
      loadMasterReports(false)
    }
  }

  // Clear all filters (except branch_id for branch managers)
  const clearFilters = () => {
    setFilters({
      branch_id: branchManagerBranchId || "",
      course_id: "",
      area_of_expertise: "",
      professional_experience: "",
      designation_id: "",
      active_only: true,
      search: ""
    })
    setSearchInput("")
  }

  // Export functionality
  const handleExport = (format: 'pdf' | 'excel') => {
    toast.info(`Exporting master report as ${format.toUpperCase()}...`)
    // TODO: Implement actual export functionality
  }

  // Check authentication
  const token = BranchManagerAuth.getToken()
  const user = BranchManagerAuth.getCurrentUser()

  if (!BranchManagerAuth.isAuthenticated() || !token || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access master reports.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader />
      
      <main className="w-full p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/branch-manager-dashboard/reports')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Reports</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Master Report</h1>
              <p className="text-gray-600">
                Comprehensive master (coach) information and analytics for your branch
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => handleExport('excel')}
            >
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => handleExport('pdf')}
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start pb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  className="pl-10"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap justify-between">
              {/* Branch Filter - Disabled for branch managers */}
              <Select
                value={filters.branch_id || "all"}
                onValueChange={(value) => handleFilterChange('branch_id', value)}
                disabled={true} // Always disabled for branch managers
              >
                <SelectTrigger>
                  <SelectValue placeholder="Your Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={branchManagerBranchId || "all"}>
                    {currentBranchManager?.branch_name || "Your Branch"}
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Course Filter */}
              <Select
                value={filters.course_id || "all"}
                onValueChange={(value) => handleFilterChange('course_id', value)}
                disabled={filtersLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {filterOptions?.filters.courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Area of Expertise Filter */}
              <Select
                value={filters.area_of_expertise || "all"}
                onValueChange={(value) => handleFilterChange('area_of_expertise', value)}
                disabled={filtersLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Expertise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {filterOptions?.filters.areas_of_expertise.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Professional Experience Filter */}
              <Select
                value={filters.professional_experience || "all"}
                onValueChange={(value) => handleFilterChange('professional_experience', value)}
                disabled={filtersLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Experience Levels</SelectItem>
                  {filterOptions?.filters.professional_experience.map((exp) => (
                    <SelectItem key={exp.id} value={exp.id}>
                      {exp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Designation Filter */}
              <Select
                value={filters.designation_id || "all"}
                onValueChange={(value) => handleFilterChange('designation_id', value)}
                disabled={filtersLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Designations</SelectItem>
                  {filterOptions?.filters.designations.map((designation) => (
                    <SelectItem key={designation.id} value={designation.id}>
                      {designation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Active Status Filter */}
              <Select
                value={filters.active_only.toString()}
                onValueChange={(value) => handleFilterChange('active_only', value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active Only</SelectItem>
                  <SelectItem value="false">Include Inactive</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex justify-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Masters</p>
                  <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Masters</p>
                  <p className="text-2xl font-bold text-green-600">
                    {masters.filter(m => m.is_active).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {masters.reduce((sum, m) => sum + m.assigned_courses.length, 0)}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Branch</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {currentBranchManager?.branch_name || "N/A"}
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Master Details</span>
              <Badge variant="secondary">
                {masters.length} of {pagination.total} records
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && masters.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading master reports...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={() => loadMasterReports(true)}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : masters.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Masters Found</h3>
                  <p className="text-gray-600">Try adjusting your filters to see more results.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Master</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Branch</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Courses</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Expertise</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Experience</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {masters.map((master) => (
                      <tr key={master.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{master.full_name}</p>
                            <p className="text-sm text-gray-600">{master.designation || 'No designation'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm text-gray-900">{master.email}</p>
                            <p className="text-sm text-gray-600">{master.phone}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {master.branch ? (
                            <div>
                              <p className="text-sm font-medium text-gray-900">{master.branch.name}</p>
                              <p className="text-xs text-gray-600">{master.branch.code}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No branch assigned</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            {master.assigned_courses.length > 0 ? (
                              master.assigned_courses.slice(0, 2).map((course) => (
                                <Badge key={course.id} variant="outline" className="text-xs">
                                  {course.title}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400">No courses assigned</span>
                            )}
                            {master.assigned_courses.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{master.assigned_courses.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            {master.areas_of_expertise.length > 0 ? (
                              master.areas_of_expertise.slice(0, 2).map((area) => (
                                <Badge key={area} variant="outline" className="text-xs">
                                  {area}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400">No expertise listed</span>
                            )}
                            {master.areas_of_expertise.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{master.areas_of_expertise.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-900">
                            {master.professional_experience || 'Not specified'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={master.is_active ? "default" : "secondary"}>
                            {master.is_active ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/branch-manager-dashboard/coaches/${master.id}`)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Load More Button */}
            {pagination.has_more && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Load More</span>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
