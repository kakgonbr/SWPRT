import { useState } from 'react'
import { Star, ThumbsUp, Filter, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useToast } from '../hooks/use-toast'
import { useAuth } from '../contexts/auth-context'
import type { BikeReview } from '../lib/mock-data'

interface BikeReviewsProps {
    bikeId: string
    reviews: BikeReview[]
    averageRating: number
    totalReviews: number
}

export function BikeReviews({ reviews, averageRating, totalReviews }: BikeReviewsProps) {
    const [sortBy, setSortBy] = useState('newest')
    const [filterRating, setFilterRating] = useState('all')
    const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false)
    const [newReview, setNewReview] = useState({
        rating: 0,
        title: '',
        comment: '',
        images: [] as File[]
    });
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const handleStarClick = (rating: number) => {
        setNewReview(prev => ({ ...prev, rating }))
    }

    const handleSubmitReview = async () => {
        if (!isAuthenticated) {
            toast({
                title: "Login Required",
                description: "Please login to write a review.",
                variant: "destructive"
            })
            return
        }

        if (newReview.rating === 0 || !newReview.comment.trim()) {
            toast({
                title: "Missing Information",
                description: "Please provide a rating and comment.",
                variant: "destructive"
            })
            return
        }

        try {
            // Here you would submit to your API
            console.log('Submitting review:', newReview)

            toast({
                title: "Review Submitted",
                description: "Thank you for your feedback!",
            })

            setIsWriteReviewOpen(false)
            setNewReview({ rating: 0, title: '', comment: '', images: [] })
        } catch (error) {
            toast({
                title: "Submission Failed",
                description: "Failed to submit review. Please try again.",
                variant: "destructive"
            })
        }
    }

    const filteredAndSortedReviews = reviews
        .filter(review => filterRating === 'all' || review.rating.toString() === filterRating)
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                case 'highest':
                    return b.rating - a.rating
                case 'lowest':
                    return a.rating - b.rating
                case 'helpful':
                    return b.helpfulCount - a.helpfulCount
                default:
                    return 0
            }
        })

    return (
        <div className="space-y-6">
            {/* Rating Summary */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Customer Reviews</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-5 h-5 ${star <= averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                                </div>
                                <span className="text-muted-foreground">
                                    Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        <Dialog open={isWriteReviewOpen} onOpenChange={setIsWriteReviewOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Write Review
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Write a Review</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Rating</Label>
                                        <div className="flex gap-1 mt-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => handleStarClick(star)}
                                                    className="p-1"
                                                >
                                                    <Star
                                                        className={`w-6 h-6 ${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="review-title">Title (optional)</Label>
                                        <Input
                                            id="review-title"
                                            placeholder="Summarize your experience"
                                            value={newReview.title}
                                            onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="review-comment">Your Review</Label>
                                        <Textarea
                                            id="review-comment"
                                            placeholder="Tell others about your experience with this bike..."
                                            value={newReview.comment}
                                            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                            rows={4}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => setIsWriteReviewOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSubmitReview}>
                                            Submit Review
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
            </Card>

            {/* Filters and Sort */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <Select value={filterRating} onValueChange={setFilterRating}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by rating" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All ratings</SelectItem>
                            <SelectItem value="5">5 stars</SelectItem>
                            <SelectItem value="4">4 stars</SelectItem>
                            <SelectItem value="3">3 stars</SelectItem>
                            <SelectItem value="2">2 stars</SelectItem>
                            <SelectItem value="1">1 star</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest first</SelectItem>
                        <SelectItem value="oldest">Oldest first</SelectItem>
                        <SelectItem value="highest">Highest rating</SelectItem>
                        <SelectItem value="lowest">Lowest rating</SelectItem>
                        <SelectItem value="helpful">Most helpful</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {filteredAndSortedReviews.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <p className="text-muted-foreground">No reviews match your filters.</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredAndSortedReviews.map((review) => (
                        <Card key={review.id}>
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src={review.userAvatar} alt={review.userName} />
                                        <AvatarFallback>{getInitials(review.userName)}</AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-semibold">{review.userName}</h4>
                                            {review.isVerifiedRental && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Verified Rental
                                                </Badge>
                                            )}
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(review.createdAt)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="font-medium">{review.rating}/5</span>
                                        </div>

                                        {review.title && (
                                            <h5 className="font-medium">{review.title}</h5>
                                        )}

                                        <p className="text-muted-foreground leading-relaxed">
                                            {review.comment}
                                        </p>

                                        {review.images && review.images.length > 0 && (
                                            <div className="flex gap-2">
                                                {review.images.map((image, index) => (
                                                    <img
                                                        key={index}
                                                        src={image}
                                                        alt={`Review image ${index + 1}`}
                                                        className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 pt-2">
                                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                                                <ThumbsUp className="w-4 h-4 mr-1" />
                                                Helpful ({review.helpfulCount})
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}