import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/auth-context'
import { useToast } from '../../hooks/use-toast'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../../components/ui/card'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../../components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { ScrollArea } from '../../components/ui/scroll-area'
import {
    Users,
    MessageSquare,
    Calendar,
    TrendingUp,
    Search,
    Reply,
    Send,
    Bot,
    User,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'

interface CustomerMessage {
    id: string
    customerId: string
    customerName: string
    customerEmail: string
    customerAvatar?: string
    subject: string
    message: string
    status: 'unread' | 'read' | 'replied'
    priority: 'low' | 'medium' | 'high'
    createdAt: string
    lastReplyAt?: string
    conversationHistory: ConversationMessage[]
}

interface ConversationMessage {
    id: string
    senderId: string
    senderName: string
    senderType: 'customer' | 'staff' | 'ai'
    message: string
    timestamp: string
}

interface DashboardStats {
    totalCustomers: number
    totalRentals: number
    pendingMessages: number
    monthlyRevenue: number
}

export default function StaffDashboard() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [stats, setStats] = useState<DashboardStats>({
        totalCustomers: 0,
        totalRentals: 0,
        pendingMessages: 0,
        monthlyRevenue: 0
    })
    const [customers, setCustomers] = useState<any[]>([])
    const [rentals, setRentals] = useState<any[]>([])
    const [messages, setMessages] = useState<CustomerMessage[]>([])
    const [selectedMessage, setSelectedMessage] = useState<CustomerMessage | null>(null)
    const [replyText, setReplyText] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all')
    const [isLoading, setIsLoading] = useState(true)
    const [isChatOpen, setIsChatOpen] = useState(false)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        setIsLoading(true)
        try {
            // Fetch dashboard stats
            const statsResponse = await fetch('/api/staff/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            const statsData = await statsResponse.json()
            setStats(statsData)

            // Fetch customers
            const customersResponse = await fetch('/api/staff/customers', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            const customersData = await customersResponse.json()
            setCustomers(customersData)

            // Fetch rentals
            const rentalsResponse = await fetch('/api/staff/rentals', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            const rentalsData = await rentalsResponse.json()
            setRentals(rentalsData)

            // Fetch customer messages
            const messagesResponse = await fetch('/api/staff/messages', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            const messagesData = await messagesResponse.json()
            setMessages(messagesData)

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            toast({
                title: "Error",
                description: "Failed to load dashboard data",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleReplyToMessage = async (messageId: string) => {
        if (!replyText.trim()) return

        try {
            const response = await fetch(`/api/staff/messages/${messageId}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    message: replyText,
                    staffId: user?.id,
                    staffName: user?.name
                })
            })

            if (response.ok) {
                toast({
                    title: "Reply Sent",
                    description: "Your reply has been sent to the customer"
                })
                setReplyText('')
                setIsChatOpen(false)
                fetchDashboardData() // Refresh data
            }
        } catch (error) {
            console.error('Error sending reply:', error)
            toast({
                title: "Error",
                description: "Failed to send reply",
                variant: "destructive"
            })
        }
    }

    const markMessageAsRead = async (messageId: string) => {
        try {
            await fetch(`/api/staff/messages/${messageId}/mark-read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            fetchDashboardData()
        } catch (error) {
            console.error('Error marking message as read:', error)
        }
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'unread': return 'destructive'
            case 'read': return 'secondary'
            case 'replied': return 'default'
            default: return 'outline'
        }
    }

    const getPriorityBadgeVariant = (priority: string) => {
        switch (priority) {
            case 'high': return 'destructive'
            case 'medium': return 'default'
            case 'low': return 'secondary'
            default: return 'outline'
        }
    }

    const filteredMessages = messages.filter(message => {
        const matchesSearch = message.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            message.message.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = messageFilter === 'all' || message.status === messageFilter

        return matchesSearch && matchesFilter
    })

    const openChatDialog = (message: CustomerMessage) => {
        setSelectedMessage(message)
        setIsChatOpen(true)
        if (message.status === 'unread') {
            markMessageAsRead(message.id)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Staff Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {user?.name}! Manage customers and support requests.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                        <p className="text-xs text-muted-foreground">Active users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRentals}</div>
                        <p className="text-xs text-muted-foreground">Currently rented</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Messages</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingMessages}</div>
                        <p className="text-xs text-muted-foreground">Need attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.monthlyRevenue}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="messages" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="messages">Customer Messages</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="rentals">Rental Management</TabsTrigger>
                </TabsList>

                {/* Customer Messages Tab */}
                <TabsContent value="messages" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Customer Messages</CardTitle>
                                    <CardDescription>
                                        Manage customer support requests and conversations
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Search messages..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8 w-64"
                                        />
                                    </div>
                                    <select
                                        value={messageFilter}
                                        onChange={(e) => setMessageFilter(e.target.value as any)}
                                        className="px-3 py-2 border rounded-md"
                                    >
                                        <option value="all">All Messages</option>
                                        <option value="unread">Unread</option>
                                        <option value="read">Read</option>
                                        <option value="replied">Replied</option>
                                    </select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Message Preview</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredMessages.map((message) => (
                                        <TableRow key={message.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={message.customerAvatar} />
                                                        <AvatarFallback>
                                                            {message.customerName.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{message.customerName}</div>
                                                        <div className="text-sm text-muted-foreground">{message.customerEmail}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{message.subject}</TableCell>
                                            <TableCell className="max-w-xs truncate">{message.message}</TableCell>
                                            <TableCell>
                                                <Badge variant={getPriorityBadgeVariant(message.priority)}>
                                                    {message.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(message.status)}>
                                                    {message.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(message.createdAt), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    onClick={() => openChatDialog(message)}
                                                >
                                                    <Reply className="h-4 w-4 mr-1" />
                                                    Reply
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Customers Tab */}
                <TabsContent value="customers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Management</CardTitle>
                            <CardDescription>View and manage customer accounts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Total Rentals</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={customer.avatarUrl} />
                                                        <AvatarFallback>
                                                            {customer.name.split(' ').map((n: string) => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="font-medium">{customer.name}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{customer.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                                                    {customer.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(customer.createdAt), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell>{customer.rentalCount || 0}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Rentals Tab */}
                <TabsContent value="rentals" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rental Management</CardTitle>
                            <CardDescription>Monitor and manage active rentals</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Bike</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Total Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rentals.map((rental) => (
                                        <TableRow key={rental.id}>
                                            <TableCell>{rental.customerName}</TableCell>
                                            <TableCell>{rental.bikeName}</TableCell>
                                            <TableCell>
                                                {format(new Date(rental.startDate), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(rental.endDate), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={rental.status === 'active' ? 'default' : 'secondary'}>
                                                    {rental.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>${rental.totalCost}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Chat Dialog */}
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>
                            Conversation with {selectedMessage?.customerName}
                        </DialogTitle>
                        <DialogDescription>
                            Subject: {selectedMessage?.subject}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col h-[60vh]">
                        {/* Chat History */}
                        <ScrollArea className="flex-1 border rounded-md p-4 mb-4">
                            <div className="space-y-4">
                                {selectedMessage?.conversationHistory.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-3 ${msg.senderType === 'staff' ? 'flex-row-reverse' : ''
                                            }`}
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                                {msg.senderType === 'ai' ? <Bot className="h-4 w-4" /> :
                                                    msg.senderType === 'staff' ? <User className="h-4 w-4" /> :
                                                        msg.senderName.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${msg.senderType === 'staff' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                            } rounded-lg p-3`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium">{msg.senderName}</span>
                                                {msg.senderType === 'ai' && (
                                                    <Badge variant="outline" className="text-xs">AI</Badge>
                                                )}
                                                <span className="text-xs opacity-70">
                                                    {format(new Date(msg.timestamp), "HH:mm")}
                                                </span>
                                            </div>
                                            <p className="text-sm">{msg.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Reply Input */}
                        <div className="flex gap-2">
                            <Textarea
                                placeholder="Type your reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="flex-1"
                                rows={3}
                            />
                            <Button
                                onClick={() => selectedMessage && handleReplyToMessage(selectedMessage.id)}
                                disabled={!replyText.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}