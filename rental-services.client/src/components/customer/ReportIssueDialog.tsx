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
import { useToast } from '../../contexts/toast-context'
import {
    Wrench,
    Send,
    CreditCard,
    HelpCircle
} from 'lucide-react'
import type { Rental } from '../../lib/types'

interface ReportIssueDialogProps {
    isOpen: boolean
    onClose: () => void
    rental: Rental | null
    userInfo: { id: string, name: string, email: string }
}

const REPORT_TYPES = [
    { id: 1, label: 'Vehicle Issue', icon: <Wrench className="h-4 w-4" /> },
    { id: 2, label: 'Payment Issue', icon: <CreditCard className="h-4 w-4" /> },
    { id: 3, label: 'Other', icon: <HelpCircle className="h-4 w-4" /> },
]

export default function ReportIssueDialog({
    isOpen,
    onClose,
    userInfo
}: ReportIssueDialogProps) {
    const { toast } = useToast();
    const token = localStorage.getItem('token') || '';
    const { submitReport } = useCustomerReport(token);
    const [formData, setFormData] = useState({
        typeId: '',
        title: '',
        body: '',
        image: null as File | null,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const resetForm = () => {
        setFormData({
            typeId: '',
            title: '',
            body: '',
            image: null
        })
        setImagePreview(null)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        setFormData(prev => ({ ...prev, image: file }))
        if (file) {
            const reader = new FileReader()
            reader.onload = (ev) => {
                setImagePreview(ev.target?.result as string)
            }
            reader.readAsDataURL(file)
        } else {
            setImagePreview(null)
        }
    }

    const handleSubmit = async () => {
        if (!formData.typeId || !formData.title || !formData.body || !formData.image) {
            toast({
                title: 'Lack information',
                description: 'Please fill in all required information',
                variant: 'destructive'
            })
            return
        }
        if (formData.title.length > 80) {
            toast({
                title: 'Title too long',
                description: 'Number of character must be lower 80.',
                variant: 'destructive'
            })
            return
        }
        setIsSubmitting(true)
        const result = await submitReport({
            userId: Number(userInfo.id),
            typeId: Number(formData.typeId),
            title: formData.title,
            body: formData.body,
            image: formData.image!
        });
        if (result.success) {
            toast({
                title: 'Success',
                description: 'You have created report successfully.',
                variant: 'default'
            });
            resetForm();
            onClose();
        } else {
            toast({
                title: 'Error',
                description: result.message || 'Create report failed.',
                variant: 'destructive'
            });
        }
        setIsSubmitting(false);
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-orange-500" />
                        Report Issue
                    </DialogTitle>
                    <DialogDescription>
                        Please fill in all required information in the report
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="typeId">Report type *</Label>
                        <Select value={formData.typeId} onValueChange={value => setFormData(prev => ({ ...prev, typeId: value }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select report type" />
                            </SelectTrigger>
                            <SelectContent>
                                {REPORT_TYPES.map(rt => (
                                    <SelectItem key={rt.id} value={String(rt.id)}>
                                        <div className="flex items-center gap-2">{rt.icon}{rt.label}</div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Number of character must be lower 80"
                            maxLength={80}
                        />
                        <p className="text-xs text-muted-foreground">{formData.title.length}/80 characters</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="body">Description *</Label>
                        <Textarea
                            id="body"
                            value={formData.body}
                            onChange={e => setFormData(prev => ({ ...prev, body: e.target.value }))}
                            placeholder="Mô tả chi tiết sự cố..."
                            rows={5}
                            maxLength={800}
                        />
                        <p className="text-xs text-muted-foreground">{formData.body.length}/800 ký tự</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image">Image *</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {imagePreview && (
                            <img src={imagePreview} alt="Preview" className="max-h-40 mt-2 rounded border" />
                        )}
                    </div>
                </div>
                <DialogFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!formData.typeId || !formData.title || !formData.body || !formData.image || isSubmitting}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Reporting Issue...' : 'Report Issue'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}