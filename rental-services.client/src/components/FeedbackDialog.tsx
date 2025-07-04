import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { useToast } from '../contexts/toast-context'
import { Star, Heart } from 'lucide-react'

interface FeedbackDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function FeedbackDialog({ isOpen, onClose }: FeedbackDialogProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [screenshot, setScreenshot] = useState<File | null>(null)
    const [systemRating, setSystemRating] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim() || !description.trim() || systemRating === 0) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields and provide a rating.",
                variant: "destructive"
            })
            return
        }

        setIsSubmitting(true)

        try {
            // Create FormData for file upload
            const formData = new FormData()
            formData.append('title', title)
            formData.append('description', description)
            formData.append('systemRating', systemRating.toString())
            formData.append('currentPage', window.location.pathname)
            formData.append('timestamp', new Date().toISOString())

            if (screenshot) {
                formData.append('screenshot', screenshot)
            }

            // Replace with your actual API endpoint
            const response = await fetch('/api/support/feedback', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to submit feedback')
            }

            toast({
                title: "Feedback Submitted",
                description: "Thank you for your valuable feedback! We appreciate your input.",
            })

            // Reset form
            setTitle('')
            setDescription('')
            setScreenshot(null)
            setSystemRating(0)
            onClose()

        } catch (error) {
            console.error('Error submitting feedback:', error)
            toast({
                title: "Submission Failed",
                description: "Failed to submit your feedback. Please try again.",
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

    const handleStarClick = (rating: number) => {
        setSystemRating(rating)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        Share Your Feedback
                    </DialogTitle>
                    <DialogDescription>
                        Help us improve VroomVroom by sharing your experience and suggestions.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            placeholder="Brief summary of your feedback"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            placeholder="Tell us what you think about our service, features, or overall experience..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>System Rating *</Label>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleStarClick(star)}
                                        className="p-1 hover:scale-110 transition-transform"
                                    >
                                        <Star
                                            className={`w-6 h-6 ${star <= systemRating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300 hover:text-yellow-300'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            {systemRating > 0 && (
                                <span className="text-sm text-muted-foreground ml-2">
                                    {systemRating}/5 stars
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Rate your overall experience with our system
                        </p>
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
                            disabled={isSubmitting || !title.trim() || !description.trim() || systemRating === 0}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}