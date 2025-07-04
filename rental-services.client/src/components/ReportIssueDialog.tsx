import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from './ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { useToast } from '../contexts/toast-context'
import { AlertTriangle } from 'lucide-react'

interface ReportIssueDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function ReportIssueDialog({ isOpen, onClose }: ReportIssueDialogProps) {
    const [issueType, setIssueType] = useState('')
    const [description, setDescription] = useState('')
    const [screenshot, setScreenshot] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!issueType || !description.trim()) {
            toast({
                title: "Missing Information",
                description: "Please fill in the issue type and description.",
                variant: "destructive"
            })
            return
        }

        setIsSubmitting(true)

        try {
            // Create FormData for file upload
            const formData = new FormData()
            formData.append('issueType', issueType)
            formData.append('description', description)
            formData.append('currentPage', window.location.pathname)
            formData.append('url', window.location.href)
            formData.append('userAgent', navigator.userAgent)
            formData.append('timestamp', new Date().toISOString())

            if (screenshot) {
                formData.append('screenshot', screenshot)
            }

            // Replace with your actual API endpoint
            const response = await fetch('/api/support/report-issue', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to submit report')
            }

            toast({
                title: "Issue Reported",
                description: "Thank you for reporting this issue. Our team will investigate it.",
            })

            // Reset form
            setIssueType('')
            setDescription('')
            setScreenshot(null)
            onClose()

        } catch (error) {
            console.error('Error submitting report:', error)
            toast({
                title: "Submission Failed",
                description: "Failed to submit your report. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "File Too Large",
                    description: "Please upload an image smaller than 5MB",
                    variant: "destructive"
                })
                return
            }
            setScreenshot(file)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Report an Issue
                    </DialogTitle>
                    <DialogDescription>
                        Report bugs, errors, or technical problems you've encountered.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="issueType">Issue Type *</Label>
                        <Select value={issueType} onValueChange={setIssueType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select issue type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bug">Bug/Error</SelectItem>
                                <SelectItem value="ui">UI/UX Problem</SelectItem>
                                <SelectItem value="performance">Performance Issue</SelectItem>
                                <SelectItem value="payment">Payment Problem</SelectItem>
                                <SelectItem value="rental">Rental System Issue</SelectItem>
                                <SelectItem value="account">Account Problem</SelectItem>
                                <SelectItem value="security">Security Concern</SelectItem>
                                <SelectItem value="other">Other Technical Issue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Problem Description *</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the issue in detail... What happened? What did you expect to happen? When did it occur?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="screenshot">Screenshot (optional)</Label>
                        <Input
                            id="screenshot"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {screenshot && (
                            <p className="text-sm text-muted-foreground">
                                Selected: {screenshot.name}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Screenshots help us understand and fix the issue faster
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !issueType || !description.trim()}
                        >
                            {isSubmitting ? 'Submitting...' : 'Report Issue'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}