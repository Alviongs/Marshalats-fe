"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRegistration } from "@/contexts/RegistrationContext"
import { toast } from "@/components/ui/use-toast"

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  difficulty_level: string;
  pricing: {
    currency: string;
    amount: number;
  };
  available_durations: Array<{
    id: string;
    name: string;
    code: string;
    duration_months: number;
    pricing_multiplier: number;
  }>;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
  icon_url: string | null;
  color_code: string;
  course_count: number;
  subcategories: Array<{
    id: string;
    name: string;
    code: string;
    course_count: number;
  }>;
}

export default function SelectCoursePage() {
  const router = useRouter()
  const { registrationData, updateRegistrationData } = useRegistration()
  
  const [formData, setFormData] = useState({
    category_id: registrationData.category_id || "",
    course_id: registrationData.course_id || "",
    duration: registrationData.duration || "",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [courses, setCourses] = useState<Course[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('http://localhost:8003/api/categories/public/details?active_only=true')
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        
        const data = await response.json()
        setCategories(data.categories || [])
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories. Please try again later.')
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Fetch courses when category is selected
  useEffect(() => {
    const fetchCourses = async () => {
      if (!formData.category_id) return

      try {
        setIsLoadingCourses(true)
        setError(null) // Clear any previous errors

        const response = await fetch(`http://localhost:8003/api/courses/public/by-category/${formData.category_id}?active_only=true`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const coursesData = data.courses || []
        setCourses(coursesData)

        // Log for debugging
        console.log(`Fetched ${coursesData.length} courses for category ${formData.category_id}`)

      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Failed to load courses. Please check your connection and try again.')
        setCourses([]) // Clear courses on error
        toast({
          title: "Error",
          description: "Failed to load courses. Please check your connection and try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCourses(false)
      }
    }

    if (formData.category_id) {
      fetchCourses()
    } else {
      setCourses([])
      setFormData(prev => ({ ...prev, course_id: '', duration: '' }))
    }
  }, [formData.category_id])

  // Get selected category and course
  const selectedCategory = categories.find(cat => cat.id === formData.category_id)
  const selectedCourse = courses.find(course => course.id === formData.course_id)
  
  // Get duration options for selected course
  const durationOptions = selectedCourse?.available_durations || []

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.category_id || !formData.course_id || !formData.duration) {
      toast({
        title: "Incomplete Selection",
        description: "Please select a category, course, and duration",
        variant: "destructive",
      })
      return
    }
    
    // Update registration context with course data
    updateRegistrationData({
      category_id: formData.category_id,
      course_id: formData.course_id,
      duration: formData.duration,
      course_name: selectedCourse?.title || "",
      category_name: selectedCategory?.name || "",
    })
    router.push("/register/select-branch")
  }

  const handleSelectChange = (field: string, value: string) => {
    if (field === 'category_id') {
      // Reset course and duration when category changes
      setFormData(prev => ({
        ...prev,
        category_id: value,
        course_id: "",
        duration: ""
      }))
    } else if (field === 'course_id') {
      // Reset duration when course changes
      setFormData(prev => ({
        ...prev,
        course_id: value,
        duration: ""
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-200 items-center justify-center relative overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/select-course-left.png')",
          }}
        />
      </div>

      {/* Right Side - Course Selection Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-black">Select Course</h1>
            <p className="text-gray-500 text-sm">Choose your preferred course and duration to continue.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : (
          <form onSubmit={handleNextStep} className="space-y-6">
            {/* Select Category */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleSelectChange("category_id", value)}
                disabled={isLoading || categories.length === 0}
              >
                <SelectTrigger className="w-full pl-12 py-6 text-base">
                  <SelectValue placeholder={isLoading ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.course_count} courses)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Choose Course */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <Select
                value={formData.course_id}
                onValueChange={(value) => handleSelectChange("course_id", value)}
                disabled={!formData.category_id || isLoadingCourses}
              >
                <SelectTrigger className="w-full pl-12 py-6 text-base">
                  <SelectValue 
                    placeholder={
                      isLoadingCourses 
                        ? "Loading courses..." 
                        : !formData.category_id 
                          ? "Select a category first" 
                          : courses.length === 0 
                            ? "No courses available" 
                            : "Select a course"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {courses.length === 0 && formData.category_id && !isLoadingCourses ? (
                    <div className="p-4 text-center text-gray-500">
                      <p>No courses available for this category</p>
                      <p className="text-xs mt-1">Please select a different category</p>
                    </div>
                  ) : (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{course.title}</span>
                          <span className="text-xs text-gray-500">{course.code} • {course.difficulty_level}</span>
                          <span className="text-sm font-semibold mt-1">
                            {course.pricing.currency} {course.pricing.amount}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Select Duration */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <Select
                value={formData.duration}
                onValueChange={(value) => handleSelectChange("duration", value)}
                disabled={!formData.course_id || durationOptions.length === 0}
              >
                <SelectTrigger className="w-full pl-12 py-6 text-base">
                  <SelectValue 
                    placeholder={!formData.course_id ? "Select a course first" : durationOptions.length === 0 ? "No duration options available" : "Select duration"} 
                  />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((duration) => (
                    <SelectItem key={duration.id} value={duration.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{duration.name}</span>
                        <span className="text-xs text-gray-500">
                          {duration.duration_months} months • {duration.pricing_multiplier}x pricing
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Next Step Button */}
            <Button 
              type="submit" 
              className="w-full py-6 text-base"
              disabled={!formData.category_id || !formData.course_id || !formData.duration}
            >
              Continue
            </Button>
          </form>
          )}

          {/* Step Indicator */}
          <div className="text-center py-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">1</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">2</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">4</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">5</div>
            </div>
            <span className="text-gray-500 text-sm font-medium">Step 2 of 5 - Course Selection</span>
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
