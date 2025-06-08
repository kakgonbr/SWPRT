import { useState } from 'react'
import { useCustomerReport } from '../../hooks/useCustomerReport'
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
    Camera,
    MapPin,
    Send,
    Wrench,
    Shield,
    Zap,
    Settings,
    Circle,
    Battery,
    Phone
} from 'lucide-react'
import type { Rental } from '../../lib/types'
import { type ReportFormData } from '../../types/customer-reports'

interface ReportIssueDialogProps {
    isOpen: boolean
    onClose: () => void
    rental: Rental | null
    userInfo: { id: string, name: string, email: string }
}

export default function ReportIssueDialog({
    isOpen,
    onClose,
    rental,
    userInfo
}: ReportIssueDialogProps) {
    const { submitReport, isSubmitting } = useCustomerReport()
    const [formData, setFormData] = useState<ReportFormData>({
        issueType: '',
        severity: '',
        title: '',
        description: '',
        location: ''
    })

    const resetForm = () => {
        setFormData({
            issueType: '',
            severity: '',
            title: '',
            description: '',
            location: ''
        })
    }

    const handleSubmit = async () => {
        if (!rental || !formData.issueType || !formData.severity || !formData.title || !formData.description) {
            return
        }

        try {
            await submitReport(rental, formData, userInfo)
            resetForm()
            onClose()
        } catch (error) {
            // Error is handled in the hook
        }
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const getIssueTypeIcon = (type: string) => {
        switch (type) {
            case 'engine': return <Settings className="h-4 w-4" />
            case 'battery': return <Battery className="h-4 w-4" />
            case 'tire': return <Circle className="h-4 w-4" />
            case 'brakes': return <Shield className="h-4 w-4" />
            case 'lights': return <Zap className="h-4 w-4" />
            case 'fuel': return <Wrench className="h-4 w-4" />
            case 'steering': return <Settings className="h-4 w-4" />
            case 'damage': return <AlertTriangle className="h-4 w-4" />
            default: return <Wrench className="h-4 w-4" />
        }
    }

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'critical':
                return <Badge variant="destructive">Critical - Cannot ride safely</Badge>
            case 'high':
                return <Badge variant="default" className="bg-red-500">High - Affects safety/performance</Badge>
            case 'medium':
                return <Badge variant="default" className="bg-orange-500">Medium - Minor issue but noticeable</Badge>
            case 'low':
                return <Badge variant="secondary">Low - Cosmetic or minor</Badge>
            default:
                return null
        }
    }

    const getSeverityDescription = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'Bike is unsafe to ride and you should stop immediately'
            case 'high':
                return 'Significant problem affecting safety or major functionality'
            case 'medium':
                return 'Noticeable issue but bike is still rideable'
            case 'low':
                return 'Minor cosmetic or convenience issue'
            default:
                return ''
        }
    }

    // If no rental is provided (from header), show a different message
    const isGeneralBikeReport = !rental

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-orange-500" />
                        Report Bike Issue
                    </DialogTitle>
                    <DialogDescription>
                        {isGeneralBikeReport ? (
                            "Report any bike-related problems you're experiencing during your rental."
                        ) : (
                            <>
                                Report a problem with your <strong>{rental.bikeName}</strong>.
                                Our maintenance team will be notified immediately.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Only show rental info if rental exists */}
                    {rental && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-medium mb-2 text-blue-800">Current Rental Information</h4>
                            <div className="text-sm space-y-1 text-blue-700">
                                <p><strong>Bike:</strong> {rental.bikeName}</p>
                                <p><strong>Rental ID:</strong> {rental.id}</p>
                                <p><strong>Start Date:</strong> {rental.startDate.toLocaleDateString()}</p>
                                <p><strong>Status:</strong> {rental.status}</p>
                            </div>
                        </div>
                    )}

                    {/* Show general message if no rental */}
                    {isGeneralBikeReport && (
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <h4 className="font-medium mb-2 text-orange-800">General Bike Issue Report</h4>
                            <p className="text-sm text-orange-700">
                                Use this form to report any bike-related problems you're experiencing.
                                If you're currently on a rental, please include your rental ID in the description.
                            </p>
                        </div>
                    )}

                    {/* Issue Type - Bike Specific */}
                    <div className="space-y-2">
                        <Label htmlFor="issueType">What type of bike problem are you experiencing? *</Label>
                        <Select value={formData.issueType} onValueChange={(value) => setFormData(prev => ({ ...prev, issueType: value }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select the bike issue" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="engine">
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Engine Problems (won't start, unusual sounds, performance issues)
                                    </div>
                                </SelectItem>
                                <SelectItem value="battery">
                                    <div className="flex items-center gap-2">
                                        <Battery className="h-4 w-4" />
                                        Battery Issues (dead battery, won't charge, electrical problems)
                                    </div>
                                </SelectItem>
                                <SelectItem value="tire">
                                    <div className="flex items-center gap-2">
                                        <Circle className="h-4 w-4" />
                                        Tire Problems (flat tire, puncture, low pressure, worn tread)
                                    </div>
                                </SelectItem>
                                <SelectItem value="brakes">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        Brake Issues (poor braking, squeaking, loose brakes)
                                    </div>
                                </SelectItem>
                                <SelectItem value="lights">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4" />
                                        Lighting Problems (headlight, taillight, indicators not working)
                                    </div>
                                </SelectItem>
                                <SelectItem value="fuel">
                                    <div className="flex items-center gap-2">
                                        <Wrench className="h-4 w-4" />
                                        Fuel System (fuel leak, tank issues, fuel gauge problems)
                                    </div>
                                </SelectItem>
                                <SelectItem value="steering">
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Steering/Handling (wobbling, difficult to steer, alignment issues)
                                    </div>
                                </SelectItem>
                                <SelectItem value="damage">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Physical Damage (scratches, dents, broken parts)
                                    </div>
                                </SelectItem>
                                <SelectItem value="other">
                                    <div className="flex items-center gap-2">
                                        <Wrench className="h-4 w-4" />
                                        Other Mechanical Issue
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Severity */}
                    <div className="space-y-2">
                        <Label htmlFor="severity">How serious is this issue? *</Label>
                        <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Rate the severity of the problem" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="critical">Critical - Unsafe to ride</SelectItem>
                                <SelectItem value="high">High - Major problem affecting ride</SelectItem>
                                <SelectItem value="medium">Medium - Noticeable but manageable</SelectItem>
                                <SelectItem value="low">Low - Minor issue</SelectItem>
                            </SelectContent>
                        </Select>
                        {formData.severity && (
                            <div className="mt-2 space-y-2">
                                {getSeverityBadge(formData.severity)}
                                <p className="text-xs text-muted-foreground">
                                    {getSeverityDescription(formData.severity)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Quick Description */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Brief Description *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g., 'Flat rear tire' or 'Engine won't start' or 'Dead battery'"
                            maxLength={80}
                        />
                        <p className="text-xs text-muted-foreground">
                            {formData.title.length}/80 characters
                        </p>
                    </div>

                    {/* Detailed Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">What exactly happened? *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Please describe:
• When did you first notice the problem?
• What were you doing when it happened?
• Any unusual sounds, smells, or vibrations?
• Is the bike still rideable?
• Any other details that might help our mechanics..."
                            rows={5}
                            maxLength={800}
                        />
                        <p className="text-xs text-muted-foreground">
                            {formData.description.length}/800 characters
                        </p>
                    </div>

                    {/* Current Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Where are you right now? *
                        </Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Street name, landmark, or district (e.g., 'Nguyen Hue Street, District 1' or 'Near Ben Thanh Market')"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            This helps our roadside assistance team find you quickly
                        </p>
                    </div>

                    {/* Photo Upload Placeholder */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            Photos of the Problem (Coming Soon)
                        </Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                            <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                                Photo upload will be available soon. For now, please describe the issue in detail above.
                            </p>
                        </div>
                    </div>

                    {/* Emergency Contact Info for Critical Issues */}
                    {formData.severity === 'critical' && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-800 mb-2">
                                <Phone className="h-5 w-5" />
                                <strong>Emergency Assistance</strong>
                            </div>
                            <p className="text-sm text-red-700 mb-2">
                                <strong>If this is a safety emergency, please also call us immediately:</strong>
                            </p>
                            <p className="text-sm text-red-700">
                                📞 Emergency Hotline: <strong>+84-123-456-789</strong><br />
                                📞 Roadside Assistance: <strong>+84-987-654-321</strong>
                            </p>
                            <p className="text-xs text-red-600 mt-2">
                                Stop riding immediately if the bike is unsafe. Our team will arrange pickup/replacement.
                            </p>
                        </div>
                    )}

                    {/* What happens next */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium mb-2 text-green-800">What happens next:</h4>
                        <div className="text-sm text-green-700 space-y-1">
                            <p>✓ Our maintenance team will be notified immediately</p>
                            <p>✓ For critical issues, we'll dispatch roadside assistance</p>
                            <p>✓ You'll receive SMS updates on the repair status</p>
                            <p>✓ If needed, we'll arrange a replacement bike</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!formData.issueType || !formData.severity || !formData.title || !formData.description || !formData.location || isSubmitting}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Reporting Issue...' : 'Report Bike Issue'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}