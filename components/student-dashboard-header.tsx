"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  Home,
  BookOpen,
  Calendar,
  TrendingUp,
  CreditCard,
  MessageSquare,
  Settings,
  User,
  Edit,
  UserCog,
  LogOut,
  ChevronDown,
  Bell,
  X,
  Loader2
} from "lucide-react"

interface StudentDashboardHeaderProps {
  studentName?: string
  onLogout?: () => void
  isLoading?: boolean
  notificationCount?: number
}

export default function StudentDashboardHeader({
  studentName = "Student",
  onLogout,
  isLoading = false,
  notificationCount = 0
}: StudentDashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const isActivePath = (path: string) => {
    if (!mounted) return false
    if (path === "/student-dashboard") {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  const handleNavigation = async (path: string) => {
    if (isNavigating) return

    setIsNavigating(true)
    try {
      await router.push(path)
    } catch (error) {
      console.error("Navigation error:", error)
    } finally {
      setIsNavigating(false)
    }
  }

  const handleMobileNavigation = async (path: string) => {
    setIsMobileMenuOpen(false)
    await handleNavigation(path)
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/student-dashboard",
      icon: Home,
      exact: true,
      description: "Overview and quick stats"
    },
    {
      name: "My Courses",
      path: "/student-dashboard/courses",
      icon: BookOpen,
      exact: false,
      description: "View enrolled courses"
    },
    {
      name: "Attendance",
      path: "/student-dashboard/attendance",
      icon: Calendar,
      exact: false,
      description: "Track class attendance"
    },
    {
      name: "Progress",
      path: "/student-dashboard/progress",
      icon: TrendingUp,
      exact: false,
      description: "Monitor training progress"
    },
    {
      name: "Payments",
      path: "/student-dashboard/payments",
      icon: CreditCard,
      exact: false,
      description: "Manage fees and payments"
    },
    {
      name: "Messages",
      path: "/student-dashboard/messages",
      icon: MessageSquare,
      exact: false,
      description: "Communication center"
    },
    {
      name: "Settings",
      path: "/student-dashboard/settings",
      icon: Settings,
      exact: false,
      description: "Account preferences"
    }
  ]

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Enhanced Logo/Brand */}
            <div className="flex items-center group cursor-pointer" onClick={() => handleNavigation("/student-dashboard")}>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-lg drop-shadow-sm">A</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors duration-200">
                  Academy
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Student Portal</p>
              </div>
            </div>

            {/* Enhanced Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2" role="navigation" aria-label="Main navigation">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = item.exact
                  ? pathname === item.path
                  : isActivePath(item.path)

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    disabled={isNavigating}
                    className={`relative px-3 py-2 text-sm font-medium whitespace-nowrap cursor-pointer rounded-lg transition-all duration-300 flex items-center space-x-2 group focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2 ${
                      isActive
                        ? "text-yellow-700 bg-yellow-50 shadow-sm border border-yellow-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                    } ${isNavigating ? "opacity-50 cursor-not-allowed" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    title={item.description}
                  >
                    {isNavigating && pathname !== item.path ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? "text-yellow-600" : "group-hover:scale-110"}`} />
                    )}
                    <span className="relative">
                      {item.name}
                      {isActive && (
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-yellow-400 rounded-full"></div>
                      )}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Enhanced Right side - Notifications and User Profile */}
          <div className="flex items-center space-x-3">
            {/* Enhanced Welcome message */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-700">
                Welcome back,
              </span>
              <span className="text-xs text-gray-500 -mt-1">
                {studentName}
              </span>
            </div>

            {/* Enhanced Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2.5 hover:bg-yellow-50 rounded-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2"
                aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount} unread)` : ''}`}
              >
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-yellow-600 transition-colors duration-200" />
                {notificationCount > 0 && (
                  <>
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs font-bold bg-red-500 hover:bg-red-500 animate-pulse"
                    >
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Badge>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-20"></div>
                  </>
                )}
              </Button>
            </div>

            {/* Enhanced User Profile Dropdown */}
            <div className="relative z-[1000]">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex border border-gray-200/60 items-center space-x-3 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 rounded-xl px-3 py-2 transition-all duration-300 hover:shadow-md hover:border-yellow-200 group focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2"
                    aria-label="User menu"
                  >
                    <Avatar className="w-9 h-9 ring-2 ring-gray-200/50 group-hover:ring-yellow-400/50 transition-all duration-300 shadow-sm">
                      <AvatarImage src="/placeholder.svg" alt={`${studentName}'s avatar`} />
                      <AvatarFallback className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white font-bold text-sm shadow-inner">
                        {studentName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden xl:flex flex-col items-start">
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 transition-colors duration-200">
                        {studentName}
                      </span>
                      <span className="text-xs text-gray-500">Student</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-300 group-hover:rotate-180 group-hover:text-yellow-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 z-[1000] bg-white/98 backdrop-blur-lg border border-gray-200/60 shadow-2xl rounded-xl p-3 overflow-hidden animate-in slide-in-from-top-2 duration-200"
                    sideOffset={12}
                  >
                    {/* User Info Header */}
                    <div className="px-3 py-3 border-b border-gray-100 mb-2">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10 ring-2 ring-yellow-400/30">
                          <AvatarImage src="/placeholder.svg" alt={`${studentName}'s avatar`} />
                          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold">
                            {studentName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{studentName}</p>
                          <p className="text-xs text-gray-500">Student Account</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <DropdownMenuItem
                      onClick={() => handleNavigation("/student-dashboard/profile")}
                      className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-700 transition-all duration-200 flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    >
                      <User className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <div className="flex-1">
                        <span>My Profile</span>
                        <p className="text-xs text-gray-500 group-hover:text-blue-600">View personal information</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => handleNavigation("/student-dashboard/profile/edit")}
                      className="cursor-pointer hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:text-green-700 transition-all duration-200 flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-green-400/50"
                    >
                      <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <div className="flex-1">
                        <span>Edit Profile</span>
                        <p className="text-xs text-gray-500 group-hover:text-green-600">Update your details</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => handleNavigation("/student-dashboard/settings")}
                      className="cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:text-purple-700 transition-all duration-200 flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    >
                      <UserCog className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <div className="flex-1">
                        <span>Account Settings</span>
                        <p className="text-xs text-gray-500 group-hover:text-purple-600">Preferences & security</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-3 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 transition-all duration-200 flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-red-400/50"
                    >
                      <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <div className="flex-1">
                        <span>Logout</span>
                        <p className="text-xs text-red-500 group-hover:text-red-600">Sign out of your account</p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            </div>

            {/* Enhanced Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden p-2.5 hover:bg-yellow-50 rounded-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-5 h-5 text-gray-600 group-hover:text-yellow-600 transition-colors duration-200" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-80 p-0 bg-gradient-to-b from-white via-white to-gray-50/50 backdrop-blur-lg border-l border-gray-200/60 shadow-2xl"
              >
                <div className="flex flex-col h-full">
                  {/* Enhanced Mobile Header */}
                  <SheetHeader className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-yellow-50/50 to-orange-50/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-14 h-14 ring-3 ring-yellow-400/40 shadow-lg">
                          <AvatarImage src="/placeholder.svg" alt={`${studentName}'s avatar`} />
                          <AvatarFallback className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white font-bold text-lg shadow-inner">
                            {studentName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <SheetTitle className="text-lg font-bold text-gray-900">{studentName}</SheetTitle>
                          <p className="text-sm text-gray-600 flex items-center space-x-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>Student Account</span>
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        aria-label="Close menu"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </Button>
                    </div>
                  </SheetHeader>

                  {/* Enhanced Mobile Navigation */}
                  <nav className="flex-1 p-4 overflow-y-auto" role="navigation" aria-label="Mobile navigation">
                    <div className="space-y-2">
                      {navigationItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = item.exact
                          ? pathname === item.path
                          : isActivePath(item.path)

                        return (
                          <button
                            key={item.path}
                            onClick={() => handleMobileNavigation(item.path)}
                            disabled={isNavigating}
                            className={`w-full text-left px-4 py-4 rounded-xl transition-all duration-300 flex items-center space-x-4 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2 ${
                              isActive
                                ? "bg-gradient-to-r from-yellow-100 via-yellow-50 to-orange-50 text-yellow-800 shadow-lg border border-yellow-200/60"
                                : "text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 border border-transparent hover:border-gray-200/60"
                            } ${isNavigating ? "opacity-50 cursor-not-allowed" : ""}`}
                            style={{ animationDelay: `${index * 50}ms` }}
                            aria-current={isActive ? "page" : undefined}
                          >
                            <div className={`p-2 rounded-lg transition-all duration-300 ${
                              isActive
                                ? "bg-yellow-200/50 shadow-sm"
                                : "bg-gray-100 group-hover:bg-gray-200"
                            }`}>
                              {isNavigating && pathname !== item.path ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Icon className={`w-5 h-5 transition-all duration-300 ${
                                  isActive ? "text-yellow-700" : "text-gray-600 group-hover:text-gray-800 group-hover:scale-110"
                                }`} />
                              )}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-sm">{item.name}</span>
                              <p className={`text-xs mt-0.5 transition-colors duration-200 ${
                                isActive ? "text-yellow-600" : "text-gray-500 group-hover:text-gray-600"
                              }`}>
                                {item.description}
                              </p>
                            </div>
                            {isActive && (
                              <div className="w-1 h-8 bg-yellow-400 rounded-full shadow-sm"></div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </nav>

                  {/* Enhanced Mobile Footer */}
                  <div className="p-4 border-t border-gray-200/60 bg-gradient-to-r from-gray-50/50 to-gray-100/30">
                    <div className="space-y-3">
                      {/* Quick Actions */}
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleMobileNavigation("/student-dashboard/profile")}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs border-gray-300 hover:bg-gray-50"
                        >
                          <User className="w-3 h-3 mr-1" />
                          Profile
                        </Button>
                        <Button
                          onClick={() => handleMobileNavigation("/student-dashboard/settings")}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs border-gray-300 hover:bg-gray-50"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Settings
                        </Button>
                      </div>

                      {/* Logout Button */}
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Sign Out</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="flex items-center space-x-2 text-yellow-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      )}
    </header>
  )
}
