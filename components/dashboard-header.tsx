"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Search, ChevronDown, MoreHorizontal, Menu } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { searchAPI, SearchResult, GlobalSearchResponse } from "@/lib/searchAPI"
import SearchResults from "@/components/search-results"
import NotificationDropdown from "@/components/notification-dropdown"

interface DashboardHeaderProps {
  currentPage?: string;
}

export default function DashboardHeader({ currentPage = "Dashboard" }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search functionality state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Search functionality
  const performSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      setTotalResults(0);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await searchAPI.globalSearch(query, token, { limit: 10 });
      const transformedResults = searchAPI.transformResults(response);

      setSearchResults(transformedResults);
      setTotalResults(response.total_results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.length >= 2) {
        performSearch(searchQuery);
      }
    }
    if (e.key === 'Escape') {
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  const handleCloseSearch = () => {
    setShowSearchResults(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Logout handler
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/login");
    }
  };

  // Mobile navigation handler
  const handleMobileNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  // Check if current path is active
  const isActivePath = (path: string) => {
    return pathname === path || pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200/80 backdrop-blur-sm">
      <div className="w-full px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-4 lg:space-x-6 min-w-0 flex-1">
            <div className="flex items-center space-x-3 flex-shrink-0">
              <img
                src="/placeholder-logo.svg"
                alt="Logo"
                className="w-8 h-8"
              />
              <span className="font-bold text-xl text-gray-900 hidden lg:inline tracking-tight">Rock</span>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden hover:bg-gray-100/80 transition-colors duration-200 rounded-lg"
                >
                  <Menu className="w-5 h-5 text-gray-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-white/95 backdrop-blur-md border-r border-gray-200/50">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200/60">
                    <div className="flex items-center space-x-3">
                      <img
                        src="/placeholder-logo.svg"
                        alt="Logo"
                        className="w-8 h-8"
                      />
                      <span className="font-bold text-xl text-gray-900 tracking-tight">Rock</span>
                    </div>
                  </div>
                  <nav className="flex-1 p-6">
                    <div className="space-y-3">
                      <button
                        onClick={() => handleMobileNavigation("/dashboard")}
                        className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100/80 text-sm font-medium transition-all duration-200 ${
                          isActivePath("/dashboard") && pathname === "/dashboard"
                            ? "bg-gradient-to-r from-yellow-50 to-yellow-100/50 text-yellow-800 border-l-3 border-yellow-400 shadow-sm"
                            : "text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => handleMobileNavigation("/dashboard/branches")}
                        className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100/80 text-sm font-medium transition-all duration-200 ${
                          isActivePath("/dashboard/branches")
                            ? "bg-gradient-to-r from-yellow-50 to-yellow-100/50 text-yellow-800 border-l-3 border-yellow-400 shadow-sm"
                            : "text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        Branches
                      </button>
                      <button
                        onClick={() => handleMobileNavigation("/dashboard/coaches")}
                        className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100/80 text-sm font-medium transition-all duration-200 ${
                          isActivePath("/dashboard/coaches")
                            ? "bg-gradient-to-r from-yellow-50 to-yellow-100/50 text-yellow-800 border-l-3 border-yellow-400 shadow-sm"
                            : "text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        Masters
                      </button>
                      <button
                        onClick={() => handleMobileNavigation("/dashboard/students")}
                        className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100/80 text-sm font-medium transition-all duration-200 ${
                          isActivePath("/dashboard/students")
                            ? "bg-gradient-to-r from-yellow-50 to-yellow-100/50 text-yellow-800 border-l-3 border-yellow-400 shadow-sm"
                            : "text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        Students
                      </button>

                      <button
                        onClick={() => handleMobileNavigation("/dashboard/courses")}
                        className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100/80 text-sm font-medium transition-all duration-200 ${
                          isActivePath("/dashboard/courses")
                            ? "bg-gradient-to-r from-yellow-50 to-yellow-100/50 text-yellow-800 border-l-3 border-yellow-400 shadow-sm"
                            : "text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        Courses
                      </button>

                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-500 mb-2">Attendance</p>
                        <button
                          onClick={() => handleMobileNavigation("/dashboard/attendance/students")}
                          className={`w-full text-left px-3 py-1 rounded-md hover:bg-gray-100 text-sm text-gray-600 ${
                            isActivePath("/dashboard/attendance/students") ? "bg-yellow-50 text-yellow-700" : ""
                          }`}
                        >
                          Student Attendance
                        </button>
                        <button
                          onClick={() => handleMobileNavigation("/dashboard/attendance/coaches")}
                          className={`w-full text-left px-3 py-1 rounded-md hover:bg-gray-100 text-sm text-gray-600 ${
                            isActivePath("/dashboard/attendance/coaches") ? "bg-yellow-50 text-yellow-700" : ""
                          }`}
                        >
                          Coach Attendance
                        </button>
                      </div>
                      <button
                        onClick={() => handleMobileNavigation("/dashboard/reports")}
                        className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm ${
                          isActivePath("/dashboard/reports") ? "bg-yellow-50 text-yellow-700" : ""
                        }`}
                      >
                        Reports
                      </button>
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-500 mb-2">More</p>
                        <button
                          onClick={() => handleMobileNavigation("/dashboard/payment-tracking")}
                          className={`w-full text-left px-3 py-1 rounded-md hover:bg-gray-100 text-sm text-gray-600 ${
                            isActivePath("/dashboard/payment-tracking") ? "bg-yellow-50 text-yellow-700" : ""
                          }`}
                        >
                          Payment Tracking
                        </button>

                      </div>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <button
                onClick={() => router.push("/dashboard")}
                className={`pb-4 px-1 text-sm font-semibold whitespace-nowrap cursor-pointer border-b-2 transition-all duration-300 hover:scale-105 ${
                  pathname === "/dashboard"
                    ? "text-gray-900 border-yellow-400 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push("/dashboard/branches")}
                className={`pb-4 px-1 text-sm font-semibold whitespace-nowrap cursor-pointer border-b-2 transition-all duration-300 hover:scale-105 ${
                  isActivePath("/dashboard/branches")
                    ? "text-gray-900 border-yellow-400 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300"
                }`}
              >
                Branches
              </button>
              <button
                onClick={() => router.push("/dashboard/coaches")}
                className={`pb-4 px-1 text-sm font-semibold whitespace-nowrap cursor-pointer border-b-2 transition-all duration-300 hover:scale-105 ${
                  isActivePath("/dashboard/coaches")
                    ? "text-gray-900 border-yellow-400 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300"
                }`}
              >
                Masters
              </button>
              <button
                onClick={() => router.push("/dashboard/students")}
                className={`pb-4 px-1 text-sm font-semibold whitespace-nowrap cursor-pointer border-b-2 transition-all duration-300 hover:scale-105 ${
                  isActivePath("/dashboard/students")
                    ? "text-gray-900 border-yellow-400 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300"
                }`}
              >
                Students
              </button>

              <button
                onClick={() => router.push("/dashboard/courses")}
                className={`pb-4 px-1 text-sm font-semibold whitespace-nowrap cursor-pointer border-b-2 transition-all duration-300 hover:scale-105 ${
                  isActivePath("/dashboard/courses")
                    ? "text-gray-900 border-yellow-400 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300"
                }`}
              >
                Courses
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`pb-4 px-1 text-sm font-semibold whitespace-nowrap flex items-center cursor-pointer border-b-2 transition-all duration-300 hover:scale-105 ${
                    isActivePath("/dashboard/attendance")
                      ? "text-gray-900 border-yellow-400 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300"
                  }`}>
                    Attendance
                    <ChevronDown className="w-3 h-3 ml-1 transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-lg p-1 overflow-hidden">
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/attendance/students")}
                    className="hover:bg-gray-100/80 rounded-md transition-colors duration-200 font-medium text-gray-700 hover:text-gray-900"
                  >
                    Student Attendance
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/attendance/coaches")}
                    className="hover:bg-gray-100/80 rounded-md transition-colors duration-200 font-medium text-gray-700 hover:text-gray-900"
                  >
                    Coach Attendance
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                onClick={() => router.push("/dashboard/reports")}
                className={`pb-4 px-1 text-sm font-semibold whitespace-nowrap cursor-pointer border-b-2 transition-all duration-300 hover:scale-105 ${
                  isActivePath("/dashboard/reports")
                    ? "text-gray-900 border-yellow-400 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300"
                }`}
              >
                Reports
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-600 hover:text-gray-800 p-2 cursor-pointer rounded-lg hover:bg-gray-100/80 transition-all duration-200 hover:shadow-sm">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-lg p-1 overflow-hidden">
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/categories")}
                    className="hover:bg-gray-100/80 rounded-md transition-colors duration-200 font-medium text-gray-700 hover:text-gray-900"
                  >
                    Categories Management
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/payment-tracking")}
                    className="hover:bg-gray-100/80 rounded-md transition-colors duration-200 font-medium text-gray-700 hover:text-gray-900"
                  >
                    Payment Tracking
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          {/* Search and User Controls */}
          <div className="flex items-center space-x-3 lg:space-x-5 flex-shrink-0">
            <div className="relative hidden lg:block" ref={searchContainerRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Try searching: User Name, Course Name, User ID"
                className="pl-10 w-64 xl:w-80 bg-gray-50/80 border-gray-200/60 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200 rounded-lg shadow-sm"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyPress}
              />
              {showSearchResults && (
                <SearchResults
                  results={searchResults}
                  isLoading={isSearching}
                  query={searchQuery}
                  totalResults={totalResults}
                  onClose={handleCloseSearch}
                />
              )}
            </div>

            <NotificationDropdown />

            <div className="relative z-[1000]">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-3 hover:bg-gray-100/80 rounded-lg px-3 py-2 transition-all duration-200 hover:shadow-sm"
                  >
                    <Avatar className="w-8 h-8 ring-2 ring-gray-200/50 hover:ring-yellow-400/30 transition-all duration-200">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white font-semibold text-xs">SA</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-gray-800 hidden lg:inline">Super admin</span>
                    <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-200 group-hover:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 z-[1000] bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-lg p-2 overflow-hidden"
                    sideOffset={8}
                  >
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard/profile")}
                      className="cursor-pointer hover:bg-gray-100/80 rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                    >
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard/settings")}
                      className="cursor-pointer hover:bg-gray-100/80 rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                    >
                      Settings
                    </DropdownMenuItem>
                    <div className="h-px bg-gray-200/60 my-2"></div>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer hover:bg-red-50/80 rounded-md px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
