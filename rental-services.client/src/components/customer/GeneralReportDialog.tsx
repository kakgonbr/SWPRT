import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select'
import { Badge } from '../ui/badge'
import {
    AlertTriangle,
    Send,
    Bug,
    Globe,
    CreditCard,
    Shield,
    Smartphone
} from 'lucide-react'
import { useToast } from '../../contexts/toast-context'
interface GeneralReportDialogProps {
    isOpen: boolean
    onClose: () => void
    userInfo: { id: string, name: string, email: string }
}

interface GeneralReportData {
    category: string
    priority: string
    subject: string
    description: string
    currentPage: string
    userAgent: string
}

export default function GeneralReportDialog({
    isOpen,
    onClose,
    userInfo
}: GeneralReportDialogProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<GeneralReportData>({
        category: '',
        priority: '',
        subject: '',
        description: '',
        currentPage: window.location.pathname,
        userAgent: navigator.userAgent
    })

    const resetForm = () => {
        setFormData({
            category: '',
            priority: '',
            subject: '',
            description: '',
            currentPage: window.location.pathname,
            userAgent: navigator.userAgent
        })
    }

    const handleSubmit = async () => {
        if (!formData.category || !formData.priority || !formData.subject || !formData.description) {
            return
        }

        setIsSubmitting(true)
        try {
            // Simulate API call - replace with actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 2000))

            const report = {
                id: `general-report-${Date.now()}`,
                userId: userInfo.id,
                userName: userInfo.name,
                userEmail: userInfo.email,
                category: formData.category,
                priority: formData.priority,
                subject: formData.subject,
                description: formData.description,
                currentPage: formData.currentPage,
                userAgent: formData.userAgent,
                submittedAt: new Date().toISOString(),
                status: 'new'
            }

            console.log('New general report:', report)

            toast({
                title: "Report Submitted Successfully",
                description: "Thank you for your feedback. Our team will review your report and respond if needed.",
            })

            resetForm()
            onClose()
        } catch (error) {
            console.error('Error submitting report:', error)
            toast({
                title: "Submission Failed",
                description: "Failed to submit your report. Please try again or contact support.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    //const getCategoryIcon = (category: string) => {
    //    switch (category) {
    //        case 'bug': return <Bug className="h-4 w-4" />
    //        case 'website': return <Globe className="h-4 w-4" />
    //        case 'payment': return <CreditCard className="h-4 w-4" />
    //        case 'security': return <Shield className="h-4 w-4" />
    //        case 'mobile': return <Smartphone className="h-4 w-4" />
    //        default: return <AlertTriangle className="h-4 w-4" />
    //    }
    //}

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
                return null
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bug className="h-5 w-5 text-orange-500" />
                        Report an Issue
                    </DialogTitle>
                    <DialogDescription>
                        Found a bug or have feedback about our website? Let us know and we'll look into it.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Issue Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="What type of issue is this?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bug">
                                    <div className="flex items-center gap-2">
                                        <Bug className="h-4 w-4" />
                                        Bug/Error Report
                                    </div>
                                </SelectItem>
                                <SelectItem value="website">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        Website Issue
                                    </div>
                                </SelectItem>
                                <SelectItem value="payment">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Payment Problem
                                    </div>
                                </SelectItem>
                                <SelectItem value="security">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        Security Concern
                                    </div>
                                </SelectItem>
                                <SelectItem value="mobile">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="h-4 w-4" />
                                        Mobile App Issue
                                    </div>
                                </SelectItem>
                                <SelectItem value="other">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Other
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority Level *</Label>
                        <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="How urgent is this issue?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="critical">Critical - Site is unusable</SelectItem>
                                <SelectItem value="high">High - Major functionality broken</SelectItem>
                                <SelectItem value="medium">Medium - Some features not working</SelectItem>
                                <SelectItem value="low">Low - Minor issue or suggestion</SelectItem>
                            </SelectContent>
                        </Select>
                        {formData.priority && (
                            <div className="mt-2">
                                {getPriorityBadge(formData.priority)}
                            </div>
                        )}
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="Brief description of the issue"
                            maxLength={100}
                        />
                        <p className="text-xs text-muted-foreground">
                            {formData.subject.length}/100 characters
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Detailed Description *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Please describe what happened, what you expected to happen, and steps to reproduce the issue..."
                            rows={4}
                            maxLength={1000}
                        />
                        <p className="text-xs text-muted-foreground">
                            {formData.description.length}/1000 characters
                        </p>
                    </div>

                    {/* Technical Info */}
                    <div className="space-y-4">
                        <Label>Technical Information</Label>
                        <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
                            <div>
                                <strong>Current Page:</strong> {formData.currentPage}
                            </div>
                            <div>
                                <strong>Browser:</strong> {formData.userAgent.split('(')[0].trim()}
                            </div>
                            <div>
                                <strong>Timestamp:</strong> {new Date().toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Critical Issue Warning */}
                    {formData.priority === 'critical' && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-800 mb-2">
                                <AlertTriangle className="h-5 w-5" />
                                <strong>Critical Issue</strong>
                            </div>
                            <p className="text-sm text-red-700">
                                For critical issues affecting site functionality, please also contact our support team directly at <strong>support@vroomvroom.vn</strong> or call <strong>+84-123-456-789</strong>
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!formData.category || !formData.priority || !formData.subject || !formData.description || isSubmitting}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}