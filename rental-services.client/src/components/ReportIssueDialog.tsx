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
import { useToast } from '../hooks/use-toast'

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
                title: "Report Submitted",
                description: "Thank you for your feedback. We'll look into this issue.",
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
                    <DialogTitle>Report an Issue</DialogTitle>
                    <DialogDescription>
                        Help us improve by reporting bugs or issues you've encountered.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="issueType">Issue Type</Label>
                        <Select value={issueType} onValueChange={setIssueType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select issue type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bug">Bug/Error</SelectItem>
                                <SelectItem value="feature">Feature Request</SelectItem>
                                <SelectItem value="ui">UI/UX Issue</SelectItem>
                                <SelectItem value="performance">Performance Issue</SelectItem>
                                <SelectItem value="payment">Payment Issue</SelectItem>
                                <SelectItem value="rental">Rental Problem</SelectItem>
                                <SelectItem value="account">Account Issue</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currentPage">Current Page</Label>
                        <Input
                            id="currentPage"
                            value={window.location.pathname}
                            disabled
                            className="bg-muted"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the issue in detail... What happened? What did you expect to happen?"
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
                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}