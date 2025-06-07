import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from './ui/dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import {
    CheckCircle,
    AlertTriangle,
    User,
    Calendar,
    CreditCard,
    MapPin,
    Eye
} from 'lucide-react'

interface ExtractedIdData {
    fullName: string
    dateOfBirth: string
    idNumber: string
    address: string
    documentType: string
    expiryDate?: string
    issueDate?: string
    placeOfBirth?: string
    nationality?: string
}

interface IdReviewDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    onReject: () => void
    extractedData: ExtractedIdData | null
    uploadedImageUrl: string | null
    isProcessing?: boolean
}

export default function IdReviewDialog({
    isOpen,
    onClose,
    onConfirm,
    onReject,
    extractedData,
    uploadedImageUrl,
    isProcessing = false
}: IdReviewDialogProps) {
    const [showFullImage, setShowFullImage] = useState(false)

    // Debug logs
    useEffect(() => {
        console.log('IdReviewDialog props:')
        console.log('isOpen:', isOpen)
        console.log('extractedData:', extractedData)
        console.log('uploadedImageUrl:', uploadedImageUrl)
    }, [isOpen, extractedData, uploadedImageUrl])

    // Remove the early return that might be blocking the dialog
    // if (!extractedData) return null

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch {
            return dateString
        }
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Review Extracted ID Information
                        </DialogTitle>
                        <DialogDescription>
                            Please review the information extracted from your ID document.
                            Make sure all details are correct before confirming.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Add fallback content if extractedData is null */}
                    {!extractedData ? (
                        <div className="p-8 text-center">
                            <p className="text-muted-foreground">Loading extracted information...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* ID Document Image */}
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-base font-medium">Uploaded Document</Label>
                                    <div className="mt-2">
                                        {uploadedImageUrl ? (
                                            <div className="relative">
                                                <img
                                                    src={uploadedImageUrl}
                                                    alt="Uploaded ID Document"
                                                    className="w-full max-w-md rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                                    onClick={() => setShowFullImage(true)}
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="absolute top-2 right-2"
                                                    onClick={() => setShowFullImage(true)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View Full Size
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="w-full max-w-md h-48 bg-gray-100 rounded-lg border flex items-center justify-center">
                                                <p className="text-muted-foreground">No image available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Card className="bg-blue-50 border-blue-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium text-blue-800 mb-1">
                                                    Please verify your information carefully
                                                </p>
                                                <p className="text-blue-700">
                                                    Once confirmed, only your ID number will be locked. Other information can still be edited in your profile.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Extracted Information */}
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-base font-medium">Extracted Information</Label>
                                    <div className="mt-2 space-y-4">
                                        <Card>
                                            <CardContent className="p-4 space-y-4">
                                                {/* Document Type */}
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-muted-foreground">Document Type</span>
                                                    <Badge variant="outline">{extractedData.documentType}</Badge>
                                                </div>

                                                {/* Full Name */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <Label className="text-sm font-medium">Full Name</Label>
                                                    </div>
                                                    <p className="text-lg font-semibold bg-gray-50 p-3 rounded border">
                                                        {extractedData.fullName}
                                                    </p>
                                                </div>

                                                {/* ID Number */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                        <Label className="text-sm font-medium">ID Number</Label>
                                                    </div>
                                                    <p className="text-lg font-semibold bg-gray-50 p-3 rounded border font-mono">
                                                        {extractedData.idNumber}
                                                    </p>
                                                </div>

                                                {/* Date of Birth */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <Label className="text-sm font-medium">Date of Birth</Label>
                                                    </div>
                                                    <p className="text-lg font-semibold bg-gray-50 p-3 rounded border">
                                                        {formatDate(extractedData.dateOfBirth)}
                                                    </p>
                                                </div>

                                                {/* Address */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <Label className="text-sm font-medium">Address</Label>
                                                    </div>
                                                    <p className="text-lg font-semibold bg-gray-50 p-3 rounded border">
                                                        {extractedData.address}
                                                    </p>
                                                </div>

                                                {/* Additional Information */}
                                                {(extractedData.nationality || extractedData.placeOfBirth || extractedData.expiryDate) && (
                                                    <div className="space-y-3 pt-2 border-t">
                                                        <Label className="text-sm font-medium">Additional Information</Label>

                                                        {extractedData.nationality && (
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-muted-foreground">Nationality</span>
                                                                <span className="text-sm font-medium">{extractedData.nationality}</span>
                                                            </div>
                                                        )}

                                                        {extractedData.placeOfBirth && (
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-muted-foreground">Place of Birth</span>
                                                                <span className="text-sm font-medium">{extractedData.placeOfBirth}</span>
                                                            </div>
                                                        )}

                                                        {extractedData.issueDate && (
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-muted-foreground">Issue Date</span>
                                                                <span className="text-sm font-medium">{formatDate(extractedData.issueDate)}</span>
                                                            </div>
                                                        )}

                                                        {extractedData.expiryDate && (
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-muted-foreground">Expiry Date</span>
                                                                <span className="text-sm font-medium">{formatDate(extractedData.expiryDate)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={onReject}
                            disabled={isProcessing}
                        >
                            Information is Incorrect
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={isProcessing || !extractedData}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isProcessing ? 'Saving...' : 'Confirm & Save Information'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Full Size Image Modal */}
            <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
                <DialogContent className="max-w-6xl">
                    <DialogHeader>
                        <DialogTitle>ID Document - Full Size</DialogTitle>
                    </DialogHeader>
                    {uploadedImageUrl && (
                        <div className="flex justify-center">
                            <img
                                src={uploadedImageUrl}
                                alt="ID Document Full Size"
                                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}