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
    DialogFooter,
} from '../ui/dialog'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import {
    AlertTriangle,
    Search,
    Eye,
    User,
    Calendar,
    Monitor,
    Bug,
    CheckCircle,
    Clock,
    MessageSquare
} from 'lucide-react'
import { useToast } from '../../contexts/toast-context'
interface CustomerReport {
    id: string
    issueType: string
    description: string
    customerName: string
    customerEmail: string
    currentPage: string
    url: string
    userAgent: string
    submittedAt: string
    status: 'new' | 'in-progress' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high' | 'critical'
    assignedTo?: string
    staffNotes?: string
    screenshot?: string
    resolutionTime?: string
}

// Mock reports data
const MOCK_REPORTS: CustomerReport[] = [
    {
        id: 'rpt-001',
        issueType: 'payment',
        description: 'Payment failed during checkout. I tried multiple credit cards but the transaction keeps getting declined. The error message says "Payment processing error" but my cards work fine on other sites.',
        customerName: 'John Smith',
        customerEmail: 'john.smith@email.com',
        currentPage: '/checkout',
        url: 'https://vroomvroom.vn/checkout',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        submittedAt: '2024-06-08T10:30:00Z',
        status: 'new',
        priority: 'high'
    },
    {
        id: 'rpt-002',
        issueType: 'bug',
        description: 'The bike availability calendar is not showing correct dates. When I select a date range, some bikes show as available but when I click "Book Now", it says the bike is not available for those dates.',
        customerName: 'Maria Garcia',
        customerEmail: 'maria.g@email.com',
        currentPage: '/bikes/honda-wave-110',
        url: 'https://vroomvroom.vn/bikes/honda-wave-110',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        submittedAt: '2024-06-07T14:15:00Z',
        status: 'in-progress',
        priority: 'medium',
        assignedTo: 'Tech Team',
        staffNotes: 'Investigating calendar sync issue. Checking database inconsistencies.'
    },
    {
        id: 'rpt-003',
        issueType: 'ui',
        description: 'Mobile app layout is broken on my Samsung Galaxy S21. The buttons are overlapping and I cannot tap on the "Submit" button during registration.',
        customerName: 'David Chen',
        customerEmail: 'david.chen@email.com',
        currentPage: '/auth/signup',
        url: 'https://vroomvroom.vn/auth/signup',
        userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
        submittedAt: '2024-06-07T09:45:00Z',
        status: 'resolved',
        priority: 'medium',
        assignedTo: 'UI/UX Team',
        staffNotes: 'Fixed CSS media query for Samsung Galaxy S21. Deployed in version 2.1.4',
        resolutionTime: '2024-06-07T16:30:00Z'
    },
    {
        id: 'rpt-004',
        issueType: 'security',
        description: 'I received multiple password reset emails that I did not request. This happened 5 times in the last hour. I am concerned that someone is trying to hack my account.',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.j@email.com',
        currentPage: '/profile',
        url: 'https://vroomvroom.vn/profile',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        submittedAt: '2024-06-06T18:20:00Z',
        status: 'closed',
        priority: 'critical',
        assignedTo: 'Security Team',
        staffNotes: 'Investigated. No security breach. User accidentally triggered reset multiple times. Added rate limiting to prevent future occurrences.',
        resolutionTime: '2024-06-06T20:15:00Z'
    },
    {
        id: 'rpt-005',
        issueType: 'performance',
        description: 'Website is very slow to load, especially the bike listing page. It takes more than 30 seconds to load all the bikes and images. My internet connection is good.',
        customerName: 'Mike Wilson',
        customerEmail: 'mike.w@email.com',
        currentPage: '/bikes',
        url: 'https://vroomvroom.vn/bikes',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        submittedAt: '2024-06-05T12:10:00Z',
        status: 'in-progress',
        priority: 'medium',
        assignedTo: 'DevOps Team',
        staffNotes: 'Optimizing image loading and implementing lazy loading. ETA: 2 days.'
    }
]

//interface ReportsManagementTabProps {
//    onAssignReport?: (reportId: string, assignee: string) => void
//}

export default function ReportsManagementTab() {
    const [reports, setReports] = useState<CustomerReport[]>(MOCK_REPORTS)
    const [filteredReports, setFilteredReports] = useState<CustomerReport[]>(MOCK_REPORTS)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [priorityFilter, setPriorityFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [selectedReport, setSelectedReport] = useState<CustomerReport | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
    const [staffNotes, setStaffNotes] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const { toast } = useToast()

    // Filter reports based on search and filters
    useEffect(() => {
        let filtered = reports

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.issueType.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(item => item.status === statusFilter)
        }

        // Priority filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(item => item.priority === priorityFilter)
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(item => item.issueType === typeFilter)
        }

        setFilteredReports(filtered)
    }, [reports, searchTerm, statusFilter, priorityFilter, typeFilter])

    const handleViewDetails = (report: CustomerReport) => {
        setSelectedReport(report)
        setStaffNotes(report.staffNotes || '')
        setIsDetailDialogOpen(true)
    }

    const handleUpdateStatus = async (reportId: string, newStatus: 'new' | 'in-progress' | 'resolved' | 'closed') => {
        setIsUpdating(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            const updateData: Partial<CustomerReport> = {
                status: newStatus,
                staffNotes
            }

            // Add resolution time if marking as resolved or closed
            if ((newStatus === 'resolved' || newStatus === 'closed') && selectedReport?.status !== 'resolved' && selectedReport?.status !== 'closed') {
                updateData.resolutionTime = new Date().toISOString()
            }

            setReports(prev => prev.map(item =>
                item.id === reportId ? { ...item, ...updateData } : item
            ))

            if (selectedReport?.id === reportId) {
                setSelectedReport(prev => prev ? { ...prev, ...updateData } : null)
            }

            toast({
                title: "Status Updated",
                description: `Report status changed to ${newStatus.replace('-', ' ')}`,
            })

            setIsDetailDialogOpen(false)
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Failed to update report status",
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
            case 'in-progress':
                return <Badge variant="default" className="bg-yellow-500">In Progress</Badge>
            case 'resolved':
                return <Badge variant="default" className="bg-green-500">Resolved</Badge>
            case 'closed':
                return <Badge variant="outline" className="border-gray-500 text-gray-700">Closed</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'critical':
                return <Badge variant="destructive">Critical</Badge>
            case 'high':
                return <Badge variant="default" className="bg-red-500">High</Badge>
            case 'medium':
                return <Badge variant="default" className="bg-orange-500">Medium</Badge>
            case 'low':
                return <Badge variant="secondary">Low</Badge>
            default:
                return <Badge variant="outline">{priority}</Badge>
        }
    }

    const getIssueTypeIcon = (type: string) => {
        switch (type) {
            case 'bug':
                return <Bug className="h-4 w-4" />
            case 'ui':
                return <Monitor className="h-4 w-4" />
            case 'security':
                return <AlertTriangle className="h-4 w-4" />
            default:
                return <MessageSquare className="h-4 w-4" />
        }
    }

    const statusCounts = {
        new: reports.filter(item => item.status === 'new').length,
        inProgress: reports.filter(item => item.status === 'in-progress').length,
        resolved: reports.filter(item => item.status === 'resolved').length,
        closed: reports.filter(item => item.status === 'closed').length,
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Reports</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{statusCounts.new}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{statusCounts.inProgress}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{statusCounts.resolved}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reports.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Reports Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Customer Issue Reports
                    </CardTitle>
                    <CardDescription>
                        Manage and resolve customer-reported technical issues
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search reports by description, customer, or issue type..."
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
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Filter by priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="bug">Bug/Error</SelectItem>
                                <SelectItem value="ui">UI/UX Problem</SelectItem>
                                <SelectItem value="performance">Performance</SelectItem>
                                <SelectItem value="payment">Payment</SelectItem>
                                <SelectItem value="security">Security</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Reports Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Issue</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReports.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-muted-foreground">No reports found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredReports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell>
                                                <div className="max-w-xs">
                                                    <div className="font-medium truncate">{report.issueType}</div>
                                                    <div className="text-sm text-muted-foreground truncate">
                                                        {report.description}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">{report.customerName}</div>
                                                        <div className="text-sm text-muted-foreground">{report.customerEmail}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getIssueTypeIcon(report.issueType)}
                                                    <span className="capitalize">{report.issueType}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                                            <TableCell>{getStatusBadge(report.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    {format(new Date(report.submittedAt), 'MMM d, yyyy')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(report)}
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

            {/* Report Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Issue Report Details
                        </DialogTitle>
                        <DialogDescription>
                            Review and manage customer-reported technical issues
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReport && (
                        <div className="space-y-6">
                            {/* Report Header */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                                <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Priority</Label>
                                    <div className="mt-1">{getPriorityBadge(selectedReport.priority)}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Issue Type</Label>
                                    <div className="mt-1 flex items-center gap-2">
                                        {getIssueTypeIcon(selectedReport.issueType)}
                                        <span className="capitalize">{selectedReport.issueType}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold">Customer Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">Name</Label>
                                        <p className="mt-1">{selectedReport.customerName}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Email</Label>
                                        <p className="mt-1">{selectedReport.customerEmail}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Issue Details */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold">Issue Details</h3>
                                <div>
                                    <Label className="text-sm font-medium">Description</Label>
                                    <p className="mt-1 p-3 bg-muted rounded text-sm leading-relaxed">
                                        {selectedReport.description}
                                    </p>
                                </div>
                            </div>

                            {/* Technical Information */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold">Technical Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-sm font-medium">Page</Label>
                                        <p className="text-muted-foreground font-mono">{selectedReport.currentPage}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Submitted</Label>
                                        <p className="text-muted-foreground">
                                            {format(new Date(selectedReport.submittedAt), 'PPP p')}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label className="text-sm font-medium">User Agent</Label>
                                        <p className="text-muted-foreground font-mono text-xs break-all">
                                            {selectedReport.userAgent}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Staff Notes */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold">Staff Notes</h3>
                                <Textarea
                                    placeholder="Add notes about investigation, resolution steps, or follow-up actions..."
                                    value={staffNotes}
                                    onChange={(e) => setStaffNotes(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            {/* Resolution Information */}
                            {selectedReport.resolutionTime && (
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold">Resolution</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <Label className="text-sm font-medium">Resolved By</Label>
                                            <p className="text-muted-foreground">{selectedReport.assignedTo || 'Staff'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Resolution Time</Label>
                                            <p className="text-muted-foreground">
                                                {format(new Date(selectedReport.resolutionTime), 'PPP p')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setIsDetailDialogOpen(false)}
                        >
                            Close
                        </Button>
                        <div className="space-x-2">
                            {selectedReport?.status === 'new' && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleUpdateStatus(selectedReport.id, 'in-progress')}
                                    disabled={isUpdating}
                                >
                                    Start Investigation
                                </Button>
                            )}
                            {(selectedReport?.status === 'new' || selectedReport?.status === 'in-progress') && (
                                <Button
                                    onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                                    disabled={isUpdating}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isUpdating ? 'Updating...' : 'Mark as Resolved'}
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}