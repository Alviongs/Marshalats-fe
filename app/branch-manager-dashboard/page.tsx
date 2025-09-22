"use client"
import { DualLineChart } from "@/components/charts/LineChart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Users, BookOpen, Loader2, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import add_icon from "@/public/images/add_icon.png"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { dashboardAPI, DashboardStats, Coach } from "@/lib/api"
import { paymentAPI, PaymentStats, Payment } from "@/lib/paymentAPI"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"

const chartData = [
  { _id: "01 Jan", total: 2000, count: 1000 },
  { _id: "01 Feb", total: 5000, count: 3000 },
  { _id: "01 Mar", total: 12000, count: 8000 },
  { _id: "01 Apr", total: 7000, count: 6000 },
  { _id: "01 May", total: 10000, count: 9000 },
  { _id: "01 Jun", total: 11000, count: 9500 },
  { _id: "01 Jul", total: 9000, count: 7000 },
]

const formatValue = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`
  }
  return value.toString()
}

interface Attendance {
  date: string
  studentName: string
  gender: string
  expertise: string
  email: string
  joinDate: string
  checkIn: string
  checkOut: string
  attendance: string
}

const studentData: Attendance[] = [
  {
    date: "28/04/2025",
    studentName: "Abhi ram",
    gender: "Male",
    expertise: "Martial Arts",
    email: "Abhi@gmail.com",
    joinDate: "20/04/2025",
    checkIn: "06:30 AM",
    checkOut: "09:00 AM",
    attendance: "90%",
  },
  // 👆 Add more student records here
]

const masterData: Attendance[] = [
  {
    date: "28/04/2025",
    studentName: "Master Rohan",
    gender: "Male",
    expertise: "Yoga",
    email: "rohan@gmail.com",
    joinDate: "15/04/2025",
    checkIn: "07:00 AM",
    checkOut: "10:00 AM",
    attendance: "95%",
  },
  // 👆 Add more master records here
]

export default function BranchManagerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"student" | "master">("student")
  const [month, setMonth] = useState("april")
  const [sort, setSort] = useState("today")
  const [page, setPage] = useState(1)
  const rowsPerPage = 5

  const data = activeTab === "student" ? studentData : masterData

  const paginatedData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  const totalPages = Math.ceil(data.length / rowsPerPage)
  
  // State management
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coachesLoading, setCoachesLoading] = useState(true)
  const [coachesError, setCoachesError] = useState<string | null>(null)



  // Payment data state
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null)
  const [recentPayments, setRecentPayments] = useState<Payment[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [paymentsError, setPaymentsError] = useState<string | null>(null)

  // Authentication check
  useEffect(() => {
    if (!BranchManagerAuth.isAuthenticated()) {
      router.replace('/branch-manager/login')
      return
    }
  }, [router])

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check authentication
        if (!BranchManagerAuth.isAuthenticated()) {
          router.replace('/branch-manager/login')
          return
        }

        const token = BranchManagerAuth.getToken()
        if (!token) {
          setError('Authentication token not found. Please login again.')
          return
        }

        // Get dashboard statistics from API
        const response = await dashboardAPI.getBranchManagerDashboardStats(token)
        const stats = response.dashboard_stats

        // Map API response to expected format
        const dashboardStats: DashboardStats = {
          total_students: stats.active_students || 0,
          active_students: stats.active_students || 0,
          total_coaches: stats.total_coaches || 0,
          active_coaches: stats.active_coaches || 0,
          total_branches: 1, // Branch manager sees only their branch
          active_branches: 1,
          total_courses: stats.active_courses || 0,
          active_courses: stats.active_courses || 0,
          total_enrollments: stats.active_enrollments || 0,
          active_enrollments: stats.active_enrollments || 0,
          this_month_enrollments: stats.active_enrollments || 0,
          last_month_enrollments: 0 // This would need additional API support
        }

        setDashboardStats(dashboardStats)
      } catch (err) {
        console.error('Error loading dashboard data:', err)
        setError('Failed to load dashboard statistics')
      } finally {
        setLoading(false)
      }
    }

    const loadCoachesData = async () => {
      try {
        setCoachesLoading(true)
        setCoachesError(null)

        // Check authentication
        if (!BranchManagerAuth.isAuthenticated()) {
          return
        }

        const token = BranchManagerAuth.getToken()
        if (!token) {
          setCoachesError('Authentication token not found. Please login again.')
          return
        }

        // Get coaches data from API
        const response = await dashboardAPI.getBranchManagerCoaches(token, {
          active_only: true,
          limit: 10
        })

        setCoaches(response.coaches || [])
      } catch (err) {
        console.error('Error loading coaches data:', err)
        setCoachesError('Failed to load coaches data')
      } finally {
        setCoachesLoading(false)
      }
    }

    const loadPaymentData = async () => {
      try {
        setPaymentsLoading(true)
        setPaymentsError(null)

        // Check authentication
        if (!BranchManagerAuth.isAuthenticated()) {
          return
        }

        const token = BranchManagerAuth.getToken()
        if (!token) {
          setPaymentsError('Authentication token not found. Please login again.')
          return
        }

        // Get payment statistics from API
        const paymentStatsResponse = await paymentAPI.getPaymentStats(token)

        // Get recent payments from API
        const recentPaymentsResponse = await paymentAPI.getRecentPayments(10, token)

        setPaymentStats(paymentStatsResponse)
        setRecentPayments(recentPaymentsResponse)
      } catch (err) {
        console.error('Error loading payment data:', err)
        setPaymentsError('Failed to load payment data')
      } finally {
        setPaymentsLoading(false)
      }
    }

    if (BranchManagerAuth.isAuthenticated()) {
      loadDashboardData()
      loadCoachesData()
      loadPaymentData()
    }
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader currentPage="Dashboard" />

      <main className="w-full p-4 lg:py-4 px-19">
        {/* Dashboard Header with Action Buttons */}
        <div className="flex flex-col lg:flex-row justify-between items-start py-8 mb-4 lg:items-center  gap-4">
          <h1 className="text-2xl font-medium text-gray-600">Branch Dashboard</h1>
          <div className="flex flex-wrap gap-2 lg:gap-3 text-[#6B7A99] roboto">
            <Button
              variant="outline"
              className="flex items-center space-x-1 bg-transparent text-sm"
              onClick={() => router.push("/branch-manager-dashboard/create-student")}
            >
              <img src={add_icon.src} alt="" className="w-8 h-8" />
              <span className="hidden sm:inline">Add new student</span>
              <span className="sm:hidden">Student</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-1 bg-transparent text-sm"
              onClick={() => router.push("/branch-manager-dashboard/create-course")}
            >
              <img src={add_icon.src} alt="" className="w-8 h-8" />
              <span className="hidden sm:inline">Add Course</span>
              <span className="sm:hidden">Course</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-1 bg-transparent text-sm"
              onClick={() => router.push("/branch-manager-dashboard/add-coach")}
            >
              <img src={add_icon.src} alt="" className="w-8 h-8" />
              <span className="hidden sm:inline">Add Coach</span>
              <span className="sm:hidden">Coach</span>
            </Button>
          </div>
        </div>

        {/* Revenue Chart and Coaches List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col lg:col-span-2">

             {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 xl:gap-6 gap-2 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            // Error state
            <Card className="md:col-span-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Data loaded successfully
            <>
              <Card className="h-48 shadow-md">
                <CardContent className="px-4">
                  <div className="">
                    <div className="flex justify-between flex-col gap-10">
                      <div className="flex flex-col xl:flex-row justify-between mt-4">
                      <p className="text-xs font-base text-[#9593A8]">Total Revenue</p>
                       <Badge variant="secondary" className="bg-gray-100">
                      Monthly
                    </Badge>
                    </div>
                    <div className="">
                      <p className="text-2xl font-bold text-[#403C6B]">
                        {paymentStats ? paymentAPI.formatCurrency(paymentStats.this_month_collection || 0) : '₹0'}
                      </p>
                      <p className="text-xs text-[#9593A8]">Revenue from branch operations</p>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>

              <Card className="h-48 shadow-md">
                <CardContent className="px-4">
                  <div className="">
                    <div className="flex justify-between flex-col gap-10">
                      <div className="flex flex-col xl:flex-row justify-between mt-4">
                      <p className="text-xs font-base text-[#9593A8]">Total Students</p>
                       <Badge variant="secondary" className="bg-gray-100">
                      Monthly
                    </Badge>
                    </div>
                    <div className="">
                      <p className="text-2xl font-bold text-[#403C6B]">
                        {dashboardStats ? dashboardStats.total_students : 0}
                      </p>
                      <p className="text-xs text-[#9593A8]">Students in this branch</p>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>

              <Card className="h-48 shadow-md">
                <CardContent className="px-4">
                  <div className="">
                    <div className="flex justify-between flex-col gap-10">
                      <div className="flex flex-col xl:flex-row justify-between mt-4">
                      <p className="text-xs font-base text-[#9593A8]">Active Courses</p>
                       <Badge variant="secondary" className="bg-gray-100">
                      Monthly
                    </Badge>
                    </div>
                    <div className="">
                      <p className="text-2xl font-bold text-[#403C6B]">
                        {dashboardStats ? dashboardStats.active_courses : 0}
                      </p>
                      <p className="text-xs text-[#9593A8]">Active courses in branch</p>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>

              <Card className="h-48 shadow-md">
                <CardContent className="px-4">
                  <div className="">
                    <div className="flex justify-between flex-col gap-10">
                      <div className="flex flex-col xl:flex-row justify-between mt-4">
                      <p className="text-xs font-base text-[#9593A8]">Total Coaches</p>
                       <Badge variant="secondary" className="bg-gray-100">
                      Monthly
                    </Badge>
                    </div>
                    <div className="">
                      <p className="text-2xl font-bold text-[#403C6B]">
                        {dashboardStats ? dashboardStats.total_coaches : 0}
                      </p>
                      <p className="text-xs text-[#9593A8]">Coaches in this branch</p>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

            {/* Revenue Chart */}
            <Card className="mb-6 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#4F5077] font-bold">Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <DualLineChart
                  data={chartData}
                  height={300}
                  color1="#8884d8"
                  color2="#82ca9d"
                  dataKey1="total"
                  dataKey2="count"
                  formatValue={formatValue}
                  showLegend={true}
                />
              </CardContent>
            </Card>
          </div>

          {/* Coaches List */}
          <div className="space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-[#4F5077] font-bold">
                  <Users className="w-5 h-5 mr-2" />
                  Branch Coaches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {coachesLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))
                ) : coachesError ? (
                  <div className="text-center text-red-600 py-4">
                    <AlertCircle className="w-5 h-5 mx-auto mb-2" />
                    <p className="text-sm">{coachesError}</p>
                  </div>
                ) : coaches.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No coaches found</p>
                  </div>
                ) : (
                  coaches.slice(0, 5).map((coach) => (
                    <div key={coach.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {coach.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {coach.full_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {coach.specialization}
                        </p>
                        <div className="flex items-center mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-500 ml-1">
                            {coach.experience_years} years exp
                          </span>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${coach.is_active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
