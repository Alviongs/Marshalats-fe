"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  MessageSquare,
  Send,
  Search,
  Plus,
  Reply,
  Archive,
  Trash2,
  Loader2,
  Mail,
  MailOpen,
  Clock,
  User
} from "lucide-react"
import { format } from "date-fns"
import CoachDashboardHeader from "@/components/coach-dashboard-header"
import { checkCoachAuth, getCoachAuthHeaders } from "@/lib/coachAuth"

interface Message {
  id: string
  sender_name: string
  sender_id: string
  sender_type: "student" | "admin" | "parent"
  recipient_name: string
  recipient_id: string
  subject: string
  content: string
  timestamp: string
  is_read: boolean
  is_archived: boolean
  thread_id?: string
  reply_to?: string
  priority: "low" | "normal" | "high"
}

interface MessageStats {
  total_messages: number
  unread_messages: number
  sent_messages: number
  archived_messages: number
}

export default function CoachMessagesPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [messageStats, setMessageStats] = useState<MessageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coachData, setCoachData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("inbox")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false)

  // Compose message form state
  const [composeMessage, setComposeMessage] = useState({
    recipient_id: "",
    recipient_type: "",
    subject: "",
    content: "",
    priority: "normal"
  })

  useEffect(() => {
    // Use the robust coach authentication check
    const authResult = checkCoachAuth()

    if (!authResult.isAuthenticated) {
      console.log("Coach not authenticated:", authResult.error)
      router.push("/coach/login")
      return
    }

    if (authResult.coach && authResult.token) {
      setCoachData(authResult.coach)
      fetchMessageData(authResult.token, authResult.coach.id)
    } else {
      setError("Coach information not found")
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    // Filter messages based on active tab and search term
    let filtered = messages

    // Filter by tab
    switch (activeTab) {
      case "inbox":
        filtered = filtered.filter(msg => !msg.is_archived && msg.recipient_id === coachData?.id)
        break
      case "sent":
        filtered = filtered.filter(msg => msg.sender_id === coachData?.id)
        break
      case "unread":
        filtered = filtered.filter(msg => !msg.is_read && msg.recipient_id === coachData?.id)
        break
      case "archived":
        filtered = filtered.filter(msg => msg.is_archived)
        break
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredMessages(filtered)
  }, [activeTab, searchTerm, messages, coachData])

  const fetchMessageData = async (token: string, coachId: string) => {
    try {
      setLoading(true)
      setError(null)

      // For now, we'll use mock data since the specific coach messages endpoint may not be implemented
      // In a real implementation, this would call: `/api/coaches/${coachId}/messages`
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock data for demonstration
      const mockMessages: Message[] = [
        {
          id: "1",
          sender_name: "John Smith",
          sender_id: "STU001",
          sender_type: "student",
          recipient_name: coachData?.full_name || "Coach",
          recipient_id: coachId,
          subject: "Question about Kata technique",
          content: "Hi Coach, I have a question about the third kata we learned in class. Could you please explain the proper stance for the turning movement?",
          timestamp: "2024-01-16T10:30:00Z",
          is_read: false,
          is_archived: false,
          priority: "normal"
        },
        {
          id: "2",
          sender_name: "Sarah Johnson",
          sender_id: "STU002",
          sender_type: "student",
          recipient_name: coachData?.full_name || "Coach",
          recipient_id: coachId,
          subject: "Belt test preparation",
          content: "Dear Coach, I would like to know what I need to prepare for my upcoming blue belt test. What techniques should I focus on?",
          timestamp: "2024-01-15T14:20:00Z",
          is_read: true,
          is_archived: false,
          priority: "high"
        },
        {
          id: "3",
          sender_name: "Admin Team",
          sender_id: "ADMIN001",
          sender_type: "admin",
          recipient_name: coachData?.full_name || "Coach",
          recipient_id: coachId,
          subject: "Schedule Update - New Class Added",
          content: "Hello, we've added a new beginner class on Wednesdays at 6 PM. Please confirm your availability for this slot.",
          timestamp: "2024-01-14T09:15:00Z",
          is_read: true,
          is_archived: false,
          priority: "normal"
        },
        {
          id: "4",
          sender_name: "Mike Chen's Parent",
          sender_id: "PAR001",
          sender_type: "parent",
          recipient_name: coachData?.full_name || "Coach",
          recipient_id: coachId,
          subject: "Mike's Progress Update",
          content: "Hi Coach, could you please provide an update on Mike's progress? We'd like to know how he's doing in his Kung Fu classes.",
          timestamp: "2024-01-13T16:45:00Z",
          is_read: false,
          is_archived: false,
          priority: "normal"
        }
      ]

      const mockStats: MessageStats = {
        total_messages: 24,
        unread_messages: 6,
        sent_messages: 18,
        archived_messages: 3
      }

      setMessages(mockMessages)
      setFilteredMessages(mockMessages)
      setMessageStats(mockStats)
    } catch (error) {
      console.error("Error fetching message data:", error)
      setError("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      )
    )
  }

  const handleArchiveMessage = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, is_archived: true } : msg
      )
    )
  }

  const handleSendMessage = () => {
    // Implement send message functionality
    console.log("Sending message:", composeMessage)
    setIsComposeDialogOpen(false)
    // Reset form
    setComposeMessage({
      recipient_id: "",
      recipient_type: "",
      subject: "",
      content: "",
      priority: "normal"
    })
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case "low":
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>
      default:
        return null
    }
  }

  const getSenderTypeIcon = (senderType: string) => {
    switch (senderType) {
      case "student":
        return <User className="w-4 h-4 text-blue-600" />
      case "admin":
        return <Mail className="w-4 h-4 text-purple-600" />
      case "parent":
        return <User className="w-4 h-4 text-green-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Messages"
          coachName={coachData?.full_name || "Coach"}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !messageStats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Messages"
          coachName={coachData?.full_name || "Coach"}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-red-600">
                  <p className="font-medium">Error loading messages</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachDashboardHeader 
        currentPage="Messages"
        coachName={coachData?.full_name || "Coach"}
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">Communicate with students, parents, and administration</p>
            </div>
            <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-yellow-600 hover:bg-yellow-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Compose Message
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Compose New Message</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="recipient_type">Recipient Type</label>
                    <Select value={composeMessage.recipient_type} onValueChange={(value) => setComposeMessage({...composeMessage, recipient_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="admin">Administration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="subject">Subject</label>
                    <Input
                      id="subject"
                      value={composeMessage.subject}
                      onChange={(e) => setComposeMessage({...composeMessage, subject: e.target.value})}
                      placeholder="Enter message subject"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="priority">Priority</label>
                    <Select value={composeMessage.priority} onValueChange={(value) => setComposeMessage({...composeMessage, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="content">Message</label>
                    <Textarea
                      id="content"
                      value={composeMessage.content}
                      onChange={(e) => setComposeMessage({...composeMessage, content: e.target.value})}
                      placeholder="Enter your message"
                      rows={6}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsComposeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendMessage}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Messages</p>
                    <p className="text-2xl font-bold text-gray-900">{messageStats.total_messages}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Mail className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Unread</p>
                    <p className="text-2xl font-bold text-gray-900">{messageStats.unread_messages}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Send className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sent</p>
                    <p className="text-2xl font-bold text-gray-900">{messageStats.sent_messages}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Archive className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Archived</p>
                    <p className="text-2xl font-bold text-gray-900">{messageStats.archived_messages}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {filteredMessages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No messages found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm ? "No messages match your search." : `No messages in ${activeTab}.`}
                        </p>
                      </div>
                    ) : (
                      filteredMessages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                            !message.is_read ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => {
                            setSelectedMessage(message)
                            if (!message.is_read) {
                              handleMarkAsRead(message.id)
                            }
                          }}
                        >
                          <div className="flex items-start space-x-4 flex-1">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {message.sender_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                {getSenderTypeIcon(message.sender_type)}
                                <h3 className={`font-medium ${!message.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {message.sender_name}
                                </h3>
                                {getPriorityBadge(message.priority)}
                                {!message.is_read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                              <p className={`text-sm ${!message.is_read ? 'font-medium text-gray-900' : 'text-gray-600'} truncate`}>
                                {message.subject}
                              </p>
                              <p className="text-sm text-gray-500 truncate mt-1">
                                {message.content}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {format(new Date(message.timestamp), "MMM d, yyyy 'at' h:mm a")}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-1 ml-4">
                            <Button size="sm" variant="ghost" onClick={(e) => {
                              e.stopPropagation()
                              // Handle reply
                            }}>
                              <Reply className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={(e) => {
                              e.stopPropagation()
                              handleArchiveMessage(message.id)
                            }}>
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={(e) => {
                              e.stopPropagation()
                              // Handle delete
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
