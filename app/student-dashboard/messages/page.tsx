"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import StudentDashboardHeader from "@/components/student-dashboard-header"
import { Send, Search, MessageCircle } from "lucide-react"

export default function StudentMessagesPage() {
  const router = useRouter()
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    
    if (!token) {
      router.push("/login")
      return
    }

    // Try to get user data from localStorage
    if (user) {
      try {
        const userData = JSON.parse(user)
        
        // Check if user is actually a student
        if (userData.role !== "student") {
          if (userData.role === "coach") {
            router.push("/coach-dashboard")
          } else {
            router.push("/dashboard")
          }
          return
        }
        
        setStudentData({
          name: userData.full_name || `${userData.first_name} ${userData.last_name}` || userData.name || "Student",
          email: userData.email || "student@example.com",
        })
      } catch (error) {
        console.error("Error parsing user data:", error)
        setStudentData({
          name: "Student",
          email: "student@example.com",
        })
      }
    } else {
      setStudentData({
        name: "Student",
        email: "student@example.com",
      })
    }
    
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  // Mock messages data - replace with actual API call
  const messages = [
    {
      id: 1,
      from: "Master Chen",
      subject: "Great progress in today's class!",
      preview: "I noticed significant improvement in your stance and form during today's Shaolin Kung Fu session...",
      date: "2024-01-15",
      time: "2:30 PM",
      read: false,
      type: "instructor"
    },
    {
      id: 2,
      from: "Admin Office",
      subject: "Monthly fee payment reminder",
      preview: "This is a friendly reminder that your monthly fee payment is due on January 20th...",
      date: "2024-01-14",
      time: "10:00 AM",
      read: true,
      type: "admin"
    },
    {
      id: 3,
      from: "Coach Johnson",
      subject: "Kick Boxing tournament opportunity",
      preview: "We have an upcoming local tournament and I think you're ready to participate...",
      date: "2024-01-13",
      time: "4:15 PM",
      read: false,
      type: "instructor"
    },
    {
      id: 4,
      from: "Master Kim",
      subject: "Belt promotion test scheduled",
      preview: "Congratulations! You've been selected for the upcoming belt promotion test...",
      date: "2024-01-12",
      time: "11:30 AM",
      read: true,
      type: "instructor"
    }
  ]

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "instructor":
        return "bg-blue-100 text-blue-800"
      case "admin":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentDashboardHeader 
        studentName={studentData?.name || "Student"}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#4f5077] mb-2">Messages</h1>
            <p className="text-[#4f5077]">Communication with instructors and administration</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Inbox</CardTitle>
                    <Badge variant="secondary">
                      {messages.filter(m => !m.read).length} unread
                    </Badge>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      placeholder="Search messages..." 
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => setSelectedMessage(message)}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          !message.read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                        } ${selectedMessage?.id === message.id ? "bg-yellow-50" : ""}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-sm text-gray-900">{message.from}</p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getMessageTypeColor(message.type)}`}
                          >
                            {message.type}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm text-gray-800 mb-1">{message.subject}</p>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{message.preview}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500">{message.date}</p>
                          <p className="text-xs text-gray-500">{message.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                        <CardDescription>
                          From: {selectedMessage.from} • {selectedMessage.date} at {selectedMessage.time}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getMessageTypeColor(selectedMessage.type)}
                      >
                        {selectedMessage.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed">
                          {selectedMessage.preview} Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim 
                          veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-4">
                          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat 
                          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui 
                          officia deserunt mollit anim id est laborum.
                        </p>
                      </div>
                      
                      {/* Reply Section */}
                      <div className="border-t pt-4 mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Reply</h4>
                        <div className="space-y-3">
                          <Textarea 
                            placeholder="Type your reply here..."
                            className="min-h-[100px]"
                          />
                          <div className="flex justify-end">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              <Send className="w-4 h-4 mr-2" />
                              Send Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a message</h3>
                      <p className="text-gray-500">Choose a message from the inbox to read its content</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common message actions and contacts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact Admin</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Message Instructor</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Report Issue</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
