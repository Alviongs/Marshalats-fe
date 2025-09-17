"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, BookOpen, User, Users, LogOut } from "lucide-react"

interface CoachDashboardHeaderProps {
  currentPage?: string
  coachName?: string
}

export default function CoachDashboardHeader({ 
  currentPage = "Dashboard",
  coachName = "Coach"
}: CoachDashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Mobile navigation handler
  const handleMobileNavigation = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false)
  }

  // Check if current path is active
  const isActivePath = (path: string) => {
    return pathname === path || pathname.startsWith(path)
  }

  const handleLogout = () => {
    // Clear all authentication data including coach-specific tokens
    localStorage.removeItem("access_token")
    localStorage.removeItem("token_type")
    localStorage.removeItem("expires_in")
    localStorage.removeItem("token_expiration")
    localStorage.removeItem("coach")
    localStorage.removeItem("user")
    // Also clear legacy token if exists
    localStorage.removeItem("token")
    
    console.log("Coach logged out, redirecting to coach login")
    router.push("/coach/login")
  }

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/coach-dashboard",
      icon: Home,
      exact: true
    },
    {
      name: "Assigned Courses",
      path: "/coach-dashboard/courses",
      icon: BookOpen,
      exact: false
    },
    {
      name: "Students",
      path: "/coach-dashboard/students",
      icon: Users,
      exact: false
    },
    {
      name: "Profile",
      path: "/coach-dashboard/profile",
      icon: User,
      exact: false
    }
  ]

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Coach Dashboard</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = item.exact 
                  ? pathname === item.path 
                  : isActivePath(item.path)
                
                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`pb-4 px-1 text-sm font-semibold whitespace-nowrap cursor-pointer border-b-2 transition-all duration-300 hover:scale-105 flex items-center space-x-2 ${
                      isActive
                        ? "text-gray-900 border-yellow-400 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Right side - User info and actions */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 hidden sm:inline">Welcome, {coachName}</span>
            
            {/* Desktop Logout */}
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50 hidden sm:flex"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Coach Menu</h2>
                  </div>
                  
                  <nav className="flex-1 p-4">
                    <div className="space-y-2">
                      {navigationItems.map((item) => {
                        const Icon = item.icon
                        const isActive = item.exact 
                          ? pathname === item.path 
                          : isActivePath(item.path)
                        
                        return (
                          <button
                            key={item.path}
                            onClick={() => handleMobileNavigation(item.path)}
                            className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100/80 text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                              isActive
                                ? "bg-gradient-to-r from-yellow-50 to-yellow-100/50 text-yellow-800 border-l-3 border-yellow-400 shadow-sm"
                                : "text-gray-700 hover:text-gray-900"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{item.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </nav>

                  {/* Mobile User Info and Logout */}
                  <div className="p-4 border-t">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Logged in as</p>
                      <p className="font-medium text-gray-900">{coachName}</p>
                    </div>
                    <Button 
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
