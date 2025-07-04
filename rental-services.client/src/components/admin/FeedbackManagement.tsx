import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import {
    Heart,
    Star,
    Search,
    Eye,
    MessageSquare,
    Calendar,
    User,
    TrendingUp,
    BarChart3
} from 'lucide-react'
import { useToast } from '../../contexts/toast-context'
interface CustomerFeedback {
    id: string
    title: string
    description: string
    systemRating: number
    customerName: string
    customerEmail: string
    currentPage: string
    submittedAt: string
    status: 'new' | 'reviewed' | 'responded'
    adminNotes?: string
    screenshot?: string
}

// Mock feedback data
const MOCK_FEEDBACK: CustomerFeedback[] = [
    {
        id: 'fb-001',
        title: 'Great bike rental experience!',
        description: 'I loved the Honda Wave that I rented for my Saigon city tour. The bike was in excellent condition, fuel efficient, and the pickup process was super smooth. The staff was very helpful and professional. I will definitely rent again!',
        systemRating: 5,
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.j@email.com',
        currentPage: '/bikes/honda-wave-110',
        submittedAt: '2024-06-07T14:30:00Z',
        status: 'reviewed',
        adminNotes: 'Positive feedback about Honda Wave and service quality'
    },
    {
        id: 'fb-002',
        title: 'Suggestion for mobile app',
        description: 'The website is great, but it would be amazing to have a mobile app for easier booking on the go. Also, maybe add a feature to track the bike location during rental period.',
        systemRating: 4,
        customerName: 'Mike Chen',
        customerEmail: 'mike.chen@email.com',
        currentPage: '/checkout',
        submittedAt: '2024-06-06T09:15:00Z',
        status: 'new',
    },
    {
        id: 'fb-003',
        title: 'Love the variety of bikes!',
        description: 'Amazing selection of motorcycles from scooters to adventure bikes. I rented the Yamaha Exciter for my Da Lat trip and it was perfect for the mountain roads. The pricing is very competitive too.',
        systemRating: 5,
        customerName: 'Emma Wilson',
        customerEmail: 'emma.w@email.com',
        currentPage: '/bikes',
        submittedAt: '2024-06-05T16:45:00Z',
        status: 'responded',
        adminNotes: 'Praised bike variety and pricing. Shared feedback with inventory team.'
    },
    {
        id: 'fb-004',
        title: 'Room for improvement in booking flow',
        description: 'The overall service is good, but the booking process could be simplified. Maybe reduce the number of steps and make the date picker more intuitive. Also, email confirmations could be more detailed.',
        systemRating: 3,
        customerName: 'David Park',
        customerEmail: 'david.park@email.com',
        currentPage: '/checkout',
        submittedAt: '2024-06-04T11:20:00Z',
        status: 'reviewed',
        adminNotes: 'Constructive feedback about UX improvements. Forwarded to development team.'
    },
    {
        id: 'fb-005',
        title: 'Excellent customer service!',
        description: 'Had to change my booking last minute due to weather, and the customer service team was incredibly helpful and accommodating. They waived the change fee and helped me reschedule. Outstanding service!',
        systemRating: 5,
        customerName: 'Lisa Nguyen',
        customerEmail: 'lisa.nguyen@email.com',
        currentPage: '/rentals',
        submittedAt: '2024-06-03T13:10:00Z',
        status: 'responded',
        adminNotes: 'Excellent customer service feedback. Shared with support team for recognition.'
    }
]

export default function FeedbackManagement() {
    const [feedback, setFeedback] = useState<CustomerFeedback[]>(MOCK_FEEDBACK)
    const [filteredFeedback, setFilteredFeedback] = useState<CustomerFeedback[]>(MOCK_FEEDBACK)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [ratingFilter, setRatingFilter] = useState<string>('all')
    const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
    const [adminNotes, setAdminNotes] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const { toast } = useToast()

    // Filter feedback based on search and filters
    useEffect(() => {
        let filtered = feedback

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.customerName.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(item => item.status === statusFilter)
        }

        // Rating filter
        if (ratingFilter !== 'all') {
            filtered = filtered.filter(item => item.systemRating.toString() === ratingFilter)
        }

        setFilteredFeedback(filtered)
    }, [feedback, searchTerm, statusFilter, ratingFilter])

    const handleViewDetails = (feedbackItem: CustomerFeedback) => {
        setSelectedFeedback(feedbackItem)
        setAdminNotes(feedbackItem.adminNotes || '')
        setIsDetailDialogOpen(true)
    }

    const handleUpdateStatus = async (feedbackId: string, newStatus: 'new' | 'reviewed' | 'responded') => {
        setIsUpdating(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            setFeedback(prev => prev.map(item =>
                item.id === feedbackId ? { ...item, status: newStatus, adminNotes } : item
            ))

            if (selectedFeedback?.id === feedbackId) {
                setSelectedFeedback(prev => prev ? { ...prev, status: newStatus, adminNotes } : null)
            }

            toast({
                title: "Status Updated",
                description: `Feedback status changed to ${newStatus}`,
            })

            setIsDetailDialogOpen(false)
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Failed to update feedback status",
                variant: "destructive"
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new':
                return <Badge variant="default" className="bg-blue-500">New</Badge>
            case 'reviewed':
                return <Badge variant="secondary">Reviewed</Badge>
            case 'responded':
                return <Badge variant="outline" className="border-green-500 text-green-700">Responded</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getRatingStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                className={`h-4 w-4 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
            />
        ))
    }

    const averageRating = feedback.length > 0
        ? (feedback.reduce((sum, item) => sum + item.systemRating, 0) / feedback.length).toFixed(1)
        : '0'

    const statusCounts = {
        new: feedback.filter(item => item.status === 'new').length,
        reviewed: feedback.filter(item => item.status === 'reviewed').length,
        responded: feedback.filter(item => item.status === 'responded').length,
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{feedback.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageRating}/5</div>
                        <div className="flex mt-1">
                            {getRatingStars(Math.round(parseFloat(averageRating)))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Feedback</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{statusCounts.new}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {feedback.length > 0 ? Math.round((statusCounts.responded / feedback.length) * 100) : 0}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        Customer Feedback Management
                    </CardTitle>
                    <CardDescription>
                        View and manage customer feedback to improve your service
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search feedback by title, description, or customer name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                <SelectItem value="responded">Responded</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={ratingFilter} onValueChange={setRatingFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Filter by rating" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Ratings</SelectItem>
                                <SelectItem value="5">5 Stars</SelectItem>
                                <SelectItem value="4">4 Stars</SelectItem>
                                <SelectItem value="3">3 Stars</SelectItem>
                                <SelectItem value="2">2 Stars</SelectItem>
                                <SelectItem value="1">1 Star</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Feedback Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFeedback.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-muted-foreground">No feedback found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredFeedback.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">{item.title}</div>
                                                <div className="text-sm text-muted-foreground truncate max-w-xs">
                                                    {item.description}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">{item.customerName}</div>
                                                        <div className="text-sm text-muted-foreground">{item.customerEmail}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {getRatingStars(item.systemRating)}
                                                    <span className="ml-1 text-sm font-medium">{item.systemRating}/5</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    {format(new Date(item.submittedAt), 'MMM d, yyyy')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(item)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Feedback Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-red-500" />
                            Feedback Details
                        </DialogTitle>
                        <DialogDescription>
                            Review and respond to customer feedback
                        </DialogDescription>
                    </DialogHeader>

                    {selectedFeedback && (
                        <div className="space-y-4">
                            {/* Customer Info */}
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <div className="font-medium">{selectedFeedback.customerName}</div>
                                    <div className="text-sm text-muted-foreground">{selectedFeedback.customerEmail}</div>
                                </div>
                                <div className="ml-auto">
                                    {getStatusBadge(selectedFeedback.status)}
                                </div>
                            </div>

                            {/* Feedback Content */}
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-sm font-medium">Title</Label>
                                    <p className="text-lg font-semibold">{selectedFeedback.title}</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">Rating</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getRatingStars(selectedFeedback.systemRating)}
                                        <span className="font-medium">{selectedFeedback.systemRating}/5 stars</span>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">Description</Label>
                                    <p className="mt-1 p-3 bg-muted rounded text-sm leading-relaxed">
                                        {selectedFeedback.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-sm font-medium">Page</Label>
                                        <p className="text-muted-foreground">{selectedFeedback.currentPage}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Submitted</Label>
                                        <p className="text-muted-foreground">
                                            {format(new Date(selectedFeedback.submittedAt), 'PPP p')}
                                        </p>
                                    </div>
                                </div>

                                {/* Admin Notes */}
                                <div>
                                    <Label htmlFor="admin-notes" className="text-sm font-medium">Admin Notes</Label>
                                    <Textarea
                                        id="admin-notes"
                                        placeholder="Add your notes about this feedback..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        rows={3}
                                        className="mt-1"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsDetailDialogOpen(false)}
                                    >
                                        Close
                                    </Button>
                                    <div className="space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleUpdateStatus(selectedFeedback.id, 'reviewed')}
                                            disabled={isUpdating || selectedFeedback.status === 'reviewed'}
                                        >
                                            Mark as Reviewed
                                        </Button>
                                        <Button
                                            onClick={() => handleUpdateStatus(selectedFeedback.id, 'responded')}
                                            disabled={isUpdating || selectedFeedback.status === 'responded'}
                                        >
                                            {isUpdating ? 'Updating...' : 'Mark as Responded'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}