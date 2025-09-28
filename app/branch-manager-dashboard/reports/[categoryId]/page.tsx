"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
  Eye,
  Building,
  DollarSign,
  TrendingUp
} from "lucide-react"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"

interface FilterState {
  branch_id: string
  course_id: string
  category_id: string
  status: string
  search: string
}

// Static mock data
const generateMockData = (category: string) => {
  const data = []
  for (let i = 1; i <= 15; i++) {
    switch (category) {
      case 'branch':
        data.push({
          id: `branch_${i}`,
          name: `Branch ${i}`,
          location: `Location ${i}`,
          manager_name: `Manager ${i}`,
          student_count: Math.floor(Math.random() * 100) + 20,
          status: Math.random() > 0.3 ? 'active' : 'inactive',
          created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        break
      case 'student':
        data.push({
          id: `student_${i}`,
          name: `Student ${i}`,
          email: `student${i}@example.com`,
          course_name: `Course ${Math.floor(Math.random() * 5) + 1}`,
          enrollment_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: Math.random() > 0.2 ? 'active' : 'inactive'
        })
        break
      case 'course':
        data.push({
          id: `course_${i}`,
          name: `Course ${i}`,
          category: `Category ${Math.floor(Math.random() * 3) + 1}`,
          duration: `${Math.floor(Math.random() * 12) + 1} months`,
          student_count: Math.floor(Math.random() * 50) + 5,
          status: Math.random() > 0.25 ? 'active' : 'inactive'
        })
        break
      case 'financial':
        data.push({
          id: `payment_${i}`,
          transaction_id: `TXN${1000 + i}`,
          student_name: `Student ${i}`,
          amount: Math.floor(Math.random() * 5000) + 1000,
          payment_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: Math.random() > 0.3 ? 'paid' : Math.random() > 0.5 ? 'pending' : 'overdue'
        })
        break
      case 'operational':
        data.push({
          id: `operation_${i}`,
          operation: `Operation ${i}`,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: ['maintenance', 'training', 'event', 'inspection'][Math.floor(Math.random() * 4)],
          result: Math.random() > 0.2 ? 'success' : 'pending',
          status: Math.random() > 0.2 ? 'success' : 'pending'
        })
        break
      default:
        data.push({
          id: `item_${i}`,
          name: `Item ${i}`,
          status: Math.random() > 0.3 ? 'active' : 'inactive'
        })
    }
  }
  return data
}

const mockFilterOptions = {
  branches: [
    { id: "branch_1", name: "Downtown Branch" },
    { id: "branch_2", name: "Uptown Branch" },
    { id: "branch_3", name: "Westside Branch" }
  ],
  courses: [
    { id: "course_1", name: "Karate Basics" },
    { id: "course_2", name: "Advanced Karate" },
    { id: "course_3", name: "Taekwondo" },
    { id: "course_4", name: "Judo" },
    { id: "course_5", name: "Mixed Martial Arts" }
  ]
}

export default function BranchManagerCategoryReportsPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.categoryId as string

  // Generate initial mock data based on category
  const initialMockData = generateMockData(categoryId)

  // State management
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<any[]>(initialMockData)
  const [filteredData, setFilteredData] = useState<any[]>(initialMockData)

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    branch_id: "",
    course_id: "",
    category_id: "",
    status: "",
    search: ""
  })

  // Search state
  const [searchInput, setSearchInput] = useState("")

  // Update data when category changes
  useEffect(() => {
    const newMockData = generateMockData(categoryId)
    setReportData(newMockData)
    setFilteredData(newMockData)
  }, [categoryId])

  // Filter data when filters change
  useEffect(() => {
    let filtered = [...reportData]

    if (filters.search) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(filters.search.toLowerCase())
        )
      )
    }

    if (filters.status && filters.status !== 'all_status') {
      filtered = filtered.filter(item => item.status === filters.status)
    }

    setFilteredData(filtered)
  }, [filters, reportData])

  // Update search filter when search input changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: searchInput }))
  }, [searchInput])



  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader />

      <main className="w-full p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/branch-manager-dashboard/reports')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Reports
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} Reports
              </h1>
              <p className="text-gray-600">
                {categoryId === 'branch' ? 'Branch performance and analytics' :
                 categoryId === 'student' ? 'Student enrollment and performance' :
                 categoryId === 'course' ? 'Course popularity and completion' :
                 categoryId === 'financial' ? 'Revenue and payment analytics' :
                 categoryId === 'operational' ? 'Operations and efficiency metrics' :
                 'Comprehensive analytics and insights'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert('Export PDF functionality coming soon!')}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert('Export Excel functionality coming soon!')}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total {categoryId === 'branch' ? 'Branches' :
                       categoryId === 'student' ? 'Students' :
                       categoryId === 'course' ? 'Courses' :
                       categoryId === 'financial' ? 'Revenue' :
                       categoryId === 'operational' ? 'Operations' : 'Records'}
              </CardTitle>
              {categoryId === 'branch' ? <Building className="h-4 w-4 text-muted-foreground" /> :
               categoryId === 'student' ? <Users className="h-4 w-4 text-muted-foreground" /> :
               categoryId === 'course' ? <BookOpen className="h-4 w-4 text-muted-foreground" /> :
               categoryId === 'financial' ? <DollarSign className="h-4 w-4 text-muted-foreground" /> :
               categoryId === 'operational' ? <TrendingUp className="h-4 w-4 text-muted-foreground" /> :
               <Award className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  filteredData.length.toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {categoryId === 'financial' ? 'Total amount' : 'Total count'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active {categoryId === 'branch' ? 'Branches' :
                        categoryId === 'student' ? 'Students' :
                        categoryId === 'course' ? 'Courses' :
                        categoryId === 'financial' ? 'Payments' :
                        categoryId === 'operational' ? 'Operations' : 'Records'}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  filteredData.filter(item =>
                    categoryId === 'student' ? item.status === 'active' :
                    categoryId === 'course' ? item.status === 'active' :
                    categoryId === 'financial' ? item.status === 'paid' :
                    categoryId === 'operational' ? item.status === 'success' :
                    item.status === 'active'
                  ).length.toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {categoryId === 'financial' ? 'Pending' : 'Inactive'} {categoryId === 'branch' ? 'Branches' :
                                                                        categoryId === 'student' ? 'Students' :
                                                                        categoryId === 'course' ? 'Courses' :
                                                                        categoryId === 'financial' ? 'Payments' :
                                                                        categoryId === 'operational' ? 'Operations' : 'Records'}
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  filteredData.filter(item =>
                    categoryId === 'student' ? item.status === 'inactive' :
                    categoryId === 'course' ? item.status === 'inactive' :
                    categoryId === 'financial' ? item.status === 'pending' :
                    categoryId === 'operational' ? item.status === 'pending' :
                    item.status === 'inactive'
                  ).length.toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {categoryId === 'financial' ? 'Awaiting payment' : 'Not active'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  "+12.5%"
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                From last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Branch Filter - Disabled for branch managers */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Branch</label>
                <Select
                  value={filters.branch_id}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, branch_id: value }))}
                  disabled={true} // Always disabled for branch managers
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Your Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockFilterOptions.branches.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Course Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Course</label>
                <Select
                  value={filters.course_id || "all_courses"}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, course_id: value === "all_courses" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_courses">All Courses</SelectItem>
                    {mockFilterOptions.courses.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status || "all_status"}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all_status" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_status">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    {categoryId === 'financial' && (
                      <>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium invisible">Clear</label>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      branch_id: branchManagerBranchId || "",
                      course_id: "",
                      category_id: "",
                      status: "",
                      search: ""
                    })
                    setSearchInput("")
                  }}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} Data</span>
              <Badge variant="secondary">
                {filteredData.length} total records
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading {categoryId} data...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-600">No {categoryId} data found for the selected filters.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        {categoryId === 'branch' && (
                          <>
                            <th className="text-left py-3 px-4 font-medium">Branch Name</th>
                            <th className="text-left py-3 px-4 font-medium">Location</th>
                            <th className="text-left py-3 px-4 font-medium">Manager</th>
                            <th className="text-left py-3 px-4 font-medium">Students</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                            <th className="text-left py-3 px-4 font-medium">Actions</th>
                          </>
                        )}
                        {categoryId === 'student' && (
                          <>
                            <th className="text-left py-3 px-4 font-medium">Student Name</th>
                            <th className="text-left py-3 px-4 font-medium">Email</th>
                            <th className="text-left py-3 px-4 font-medium">Course</th>
                            <th className="text-left py-3 px-4 font-medium">Enrollment Date</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                            <th className="text-left py-3 px-4 font-medium">Actions</th>
                          </>
                        )}
                        {categoryId === 'course' && (
                          <>
                            <th className="text-left py-3 px-4 font-medium">Course Name</th>
                            <th className="text-left py-3 px-4 font-medium">Category</th>
                            <th className="text-left py-3 px-4 font-medium">Duration</th>
                            <th className="text-left py-3 px-4 font-medium">Students</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                            <th className="text-left py-3 px-4 font-medium">Actions</th>
                          </>
                        )}
                        {categoryId === 'financial' && (
                          <>
                            <th className="text-left py-3 px-4 font-medium">Transaction ID</th>
                            <th className="text-left py-3 px-4 font-medium">Student</th>
                            <th className="text-left py-3 px-4 font-medium">Amount</th>
                            <th className="text-left py-3 px-4 font-medium">Date</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                            <th className="text-left py-3 px-4 font-medium">Actions</th>
                          </>
                        )}
                        {categoryId === 'operational' && (
                          <>
                            <th className="text-left py-3 px-4 font-medium">Operation</th>
                            <th className="text-left py-3 px-4 font-medium">Date</th>
                            <th className="text-left py-3 px-4 font-medium">Type</th>
                            <th className="text-left py-3 px-4 font-medium">Result</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                            <th className="text-left py-3 px-4 font-medium">Actions</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, index) => (
                        <tr key={item.id || index} className="border-b hover:bg-gray-50">
                          {categoryId === 'branch' && (
                            <>
                              <td className="py-3 px-4 font-medium">{item.name || 'N/A'}</td>
                              <td className="py-3 px-4">{item.location || item.address || 'N/A'}</td>
                              <td className="py-3 px-4">{item.manager_name || 'N/A'}</td>
                              <td className="py-3 px-4">{item.student_count || 0}</td>
                              <td className="py-3 px-4">
                                <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                                  {item.status || 'Unknown'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </td>
                            </>
                          )}
                          {categoryId === 'student' && (
                            <>
                              <td className="py-3 px-4 font-medium">{item.name || item.full_name || 'N/A'}</td>
                              <td className="py-3 px-4">{item.email || 'N/A'}</td>
                              <td className="py-3 px-4">{item.course_name || 'N/A'}</td>
                              <td className="py-3 px-4">{item.enrollment_date || item.created_at || 'N/A'}</td>
                              <td className="py-3 px-4">
                                <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                                  {item.status || 'Unknown'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </td>
                            </>
                          )}
                          {categoryId === 'course' && (
                            <>
                              <td className="py-3 px-4 font-medium">{item.name || item.course_name || 'N/A'}</td>
                              <td className="py-3 px-4">{item.category || item.category_name || 'N/A'}</td>
                              <td className="py-3 px-4">{item.duration || 'N/A'}</td>
                              <td className="py-3 px-4">{item.student_count || item.enrolled_students || 0}</td>
                              <td className="py-3 px-4">
                                <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                                  {item.status || 'Unknown'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </td>
                            </>
                          )}
                          {categoryId === 'financial' && (
                            <>
                              <td className="py-3 px-4 font-medium">{item.transaction_id || item.id || 'N/A'}</td>
                              <td className="py-3 px-4">{item.student_name || item.user_name || 'N/A'}</td>
                              <td className="py-3 px-4 font-medium">₹{item.amount || 0}</td>
                              <td className="py-3 px-4">{item.payment_date || item.created_at || 'N/A'}</td>
                              <td className="py-3 px-4">
                                <Badge variant={
                                  item.status === 'paid' ? 'default' :
                                  item.status === 'pending' ? 'secondary' :
                                  'destructive'
                                }>
                                  {item.status || 'Unknown'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </td>
                            </>
                          )}
                          {categoryId === 'operational' && (
                            <>
                              <td className="py-3 px-4 font-medium">{item.operation || item.name || 'N/A'}</td>
                              <td className="py-3 px-4">{item.date || item.created_at || 'N/A'}</td>
                              <td className="py-3 px-4">{item.type || 'N/A'}</td>
                              <td className="py-3 px-4">{item.result || 'N/A'}</td>
                              <td className="py-3 px-4">
                                <Badge variant={item.status === 'success' ? 'default' : 'secondary'}>
                                  {item.status || 'Unknown'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}