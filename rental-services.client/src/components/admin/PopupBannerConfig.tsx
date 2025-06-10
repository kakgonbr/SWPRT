import { useState } from 'react'
import { usePopupBanner } from '../../hooks/usePopupBanner'
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
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../ui/alert-dialog'
import {
    Megaphone,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Calendar
} from 'lucide-react'
import { type PopupBanner } from '../../types/admin'

export default function PopupBannerConfig() {
    const { banners, createBanner, updateBanner, deleteBanner, toggleBannerStatus } = usePopupBanner()
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedBanner, setSelectedBanner] = useState<PopupBanner | null>(null)
    const [formData, setFormData] = useState<Partial<PopupBanner>>({
        title: '',
        message: '',
        type: 'info',
        isActive: true,
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        displayPages: ['/'],
        priority: 1,
        showOnce: false,
        backgroundColor: '#3b82f6',
        textColor: '#ffffff'
    })

    const handleCreateBanner = async () => {
        if (!formData.title || !formData.message) return

        try {
            await createBanner({
                title: formData.title!,
                message: formData.message!,
                type: formData.type as any,
                isActive: formData.isActive!,
                startDate: formData.startDate!,
                endDate: formData.endDate!,
                displayPages: formData.displayPages!,
                buttonText: formData.buttonText,
                buttonLink: formData.buttonLink,
                priority: formData.priority!,
                showOnce: formData.showOnce!,
                backgroundColor: formData.backgroundColor,
                textColor: formData.textColor
            })
            setIsCreateDialogOpen(false)
            resetForm()
        } catch (error) {
            console.error('Failed to create banner:', error)
        }
    }

    const handleEditBanner = async () => {
        if (!selectedBanner || !formData.title || !formData.message) return

        try {
            await updateBanner(selectedBanner.id, formData)
            setIsEditDialogOpen(false)
            setSelectedBanner(null)
            resetForm()
        } catch (error) {
            console.error('Failed to update banner:', error)
        }
    }

    const handleDeleteBanner = async (bannerId: string) => {
        try {
            await deleteBanner(bannerId)
        } catch (error) {
            console.error('Failed to delete banner:', error)
        }
    }

    const openEditDialog = (banner: PopupBanner) => {
        setSelectedBanner(banner)
        setFormData({
            title: banner.title,
            message: banner.message,
            type: banner.type,
            isActive: banner.isActive,
            startDate: banner.startDate.slice(0, 16),
            endDate: banner.endDate.slice(0, 16),
            displayPages: banner.displayPages,
            buttonText: banner.buttonText,
            buttonLink: banner.buttonLink,
            priority: banner.priority,
            showOnce: banner.showOnce,
            backgroundColor: banner.backgroundColor,
            textColor: banner.textColor
        })
        setIsEditDialogOpen(true)
    }

    const resetForm = () => {
        setFormData({
            title: '',
            message: '',
            type: 'info',
            isActive: true,
            startDate: new Date().toISOString().slice(0, 16),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            displayPages: ['/'],
            priority: 1,
            showOnce: false,
            backgroundColor: '#3b82f6',
            textColor: '#ffffff'
        })
    }

    const getBannerTypeColor = (type: string) => {
        switch (type) {
            case 'info': return 'bg-blue-500'
            case 'warning': return 'bg-yellow-500'
            case 'success': return 'bg-green-500'
            case 'error': return 'bg-red-500'
            case 'promotion': return 'bg-purple-500'
            default: return 'bg-gray-500'
        }
    }

    const getBannerTypeText = (type: string) => {
        switch (type) {
            case 'info': return 'Info'
            case 'warning': return 'Warning'
            case 'success': return 'Success'
            case 'error': return 'Error'
            case 'promotion': return 'Promotion'
            default: return type
        }
    }

    const BannerForm = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="title">Banner Title</Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter banner title..."
                    />
                </div>
                <div>
                    <Label htmlFor="type">Banner Type</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="promotion">Promotion</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter banner message..."
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                        id="startDate"
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                </div>
                <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                        id="endDate"
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="buttonText">Button Text (Optional)</Label>
                    <Input
                        id="buttonText"
                        value={formData.buttonText || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                        placeholder="e.g., Learn More"
                    />
                </div>
                <div>
                    <Label htmlFor="buttonLink">Button Link (Optional)</Label>
                    <Input
                        id="buttonLink"
                        value={formData.buttonLink || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, buttonLink: e.target.value }))}
                        placeholder="e.g., /bikes"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2">
                        <Input
                            id="backgroundColor"
                            type="color"
                            value={formData.backgroundColor}
                            onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            className="w-16 h-10 p-1"
                        />
                        <Input
                            value={formData.backgroundColor}
                            onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            placeholder="#3b82f6"
                            className="flex-1"
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex gap-2">
                        <Input
                            id="textColor"
                            type="color"
                            value={formData.textColor}
                            onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                            className="w-16 h-10 p-1"
                        />
                        <Input
                            value={formData.textColor}
                            onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                            placeholder="#ffffff"
                            className="flex-1"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="priority">Priority (1-10)</Label>
                    <Input
                        id="priority"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    />
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="isActive">Active</Label>
                        <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="showOnce">Show Only Once</Label>
                        <Switch
                            id="showOnce"
                            checked={formData.showOnce}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showOnce: checked }))}
                        />
                    </div>
                </div>
            </div>

            {/* Preview */}
            {formData.title && formData.message && (
                <div>
                    <Label>Preview</Label>
                    <div className="border rounded-lg p-4 mt-2">
                        <div
                            className="p-4 rounded text-center"
                            style={{
                                backgroundColor: formData.backgroundColor,
                                color: formData.textColor
                            }}
                        >
                            <h4 className="font-semibold mb-2">{formData.title}</h4>
                            <p className="mb-3">{formData.message}</p>
                            {formData.buttonText && (
                                <button
                                    className="px-4 py-2 rounded border border-current hover:bg-white/10 transition-colors"
                                    style={{ borderColor: formData.textColor }}
                                >
                                    {formData.buttonText}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Megaphone className="h-6 w-6" />
                        Popup Banner Configuration
                    </h2>
                    <p className="text-muted-foreground">
                        Create and manage popup banners for announcements and promotions
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Banner
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Banner</DialogTitle>
                            <DialogDescription>
                                Create a new popup banner to display to users
                            </DialogDescription>
                        </DialogHeader>
                        <BannerForm />
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateBanner}
                                disabled={!formData.title || !formData.message}
                            >
                                Create Banner
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Banners Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Existing Banners</CardTitle>
                    <CardDescription>
                        Manage your popup banners and their display settings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {banners.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <Megaphone className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-muted-foreground">No banners created yet</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    banners.map((banner) => (
                                        <TableRow key={banner.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{banner.title}</div>
                                                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                                                        {banner.message}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getBannerTypeColor(banner.type)}>
                                                    {getBannerTypeText(banner.type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {banner.isActive ? (
                                                        <Badge variant="default" className="bg-green-500">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(banner.startDate), 'MMM d')} - {format(new Date(banner.endDate), 'MMM d')}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{banner.priority}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => toggleBannerStatus(banner.id, !banner.isActive)}
                                                    >
                                                        {banner.isActive ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditDialog(banner)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete "{banner.title}"? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteBanner(banner.id)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Banner</DialogTitle>
                        <DialogDescription>
                            Modify the banner settings and content
                        </DialogDescription>
                    </DialogHeader>
                    <BannerForm />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditBanner}
                            disabled={!formData.title || !formData.message}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}