// src/pages/ProfilePage.tsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    User,
    Mail,
    Calendar,
    MapPin,
    CreditCard,
    Camera,
    Save,
    Edit,
    Key,
    Upload,
    FileImage,
    CheckCircle,
    Loader2
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Separator } from '../components/ui/separator'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/auth-context'
import { useToast } from '../hooks/use-toast'
import { format } from 'date-fns'
import ChangePasswordDialog from '../components/ChangePasswordDialog'

export default function ProfilePage() {
    const navigate = useNavigate()
    const { user, isAuthenticated, loading } = useAuth()
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [isEditing, setIsEditing] = useState(false)
    const [isUploadingId, setIsUploadingId] = useState(false)
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        dateOfBirth: '',
        address: '',
        credentialIdNumber: '',
    })

    useEffect(() => {
        if (loading) return

        if (!isAuthenticated || !user) {
            navigate('/auth/login')
            return
        }

        // Populate form with user data
        setFormData({
            name: user.name,
            email: user.email,
            dateOfBirth: user.dateOfBirth || '',
            address: user.address || '',
            credentialIdNumber: user.credentialIdNumber || '',
        })
    }, [user, isAuthenticated, loading, navigate])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSave = () => {
        // In real app, this would update user via API
        toast({
            title: "Profile Updated",
            description: "Your profile has been updated successfully.",
        })
        setIsEditing(false)
    }

    const handleCancel = () => {
        if (!user) return

        // Reset form data
        setFormData({
            name: user.name,
            email: user.email,
            dateOfBirth: user.dateOfBirth || '',
            address: user.address || '',
            credentialIdNumber: user.credentialIdNumber || '',
        })
        setIsEditing(false)
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
    }

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin':
                return 'default'
            case 'staff':
                return 'secondary'
            default:
                return 'outline'
        }
    }

    const handleIdUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid File Type",
                description: "Please upload an image file (JPG, PNG, etc.)",
                variant: "destructive"
            })
            return
        }

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File Too Large",
                description: "Please upload an image smaller than 5MB",
                variant: "destructive"
            })
            return
        }

        setIsUploadingId(true)

        try {
            const formData = new FormData()
            formData.append('idDocument', file)

            // Replace with your actual API endpoint
            const response = await fetch('/api/user/upload-id-document', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth implementation
                }
            })

            if (!response.ok) {
                throw new Error('Upload failed')
            }

            const result = await response.json()

            // Update form data with OCR extracted ID number
            if (result.extractedIdNumber) {
                setFormData(prev => ({
                    ...prev,
                    credentialIdNumber: result.extractedIdNumber
                }))
            }

            toast({
                title: "ID Document Uploaded Successfully",
                description: "Your ID has been verified and the ID number has been extracted automatically.",
            })

            // Optionally refresh user data to get the new credentialIdImageUrl
            // You might want to call a refresh function from your auth context here

        } catch (error) {
            console.error('ID upload error:', error)
            toast({
                title: "Upload Failed",
                description: "Failed to upload ID document. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsUploadingId(false)
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const triggerIdUpload = () => {
        fileInputRef.current?.click()
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!isAuthenticated || !user) {
        return null // Will redirect
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                <p className="text-muted-foreground">
                    Manage your account information and preferences
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Overview */}
                <Card className="lg:col-span-1">
                    <CardHeader className="text-center">
                        <div className="relative mx-auto mb-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                <AvatarFallback className="text-xl">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                size="icon"
                                variant="outline"
                                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                            >
                                <Camera className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardTitle className="text-xl">{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="w-fit mx-auto mt-2">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <div className="text-sm text-muted-foreground">
                            <p>Member since</p>
                            <p className="font-medium">{format(user.createdAt, "MMMM yyyy")}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p>Last login</p>
                            {/* TODO: FIX THIS VALUE OF THE LAST LOGIN */}
                            <p className="font-medium">{user.lastLogin
                                ? format(new Date(user.lastLogin), "MMM d, yyyy")
                                : "NEVER"}
                            </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p>Feedback count</p>
                            <p className="font-medium">{user.feedbackCount} reviews</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Details */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>
                                    Update your personal details and account information
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {!isEditing ? (
                                    <Button onClick={() => setIsEditing(true)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="outline" onClick={handleCancel}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSave}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="credentialIdNumber">ID Number</Label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        id="credentialIdNumber"
                                        name="credentialIdNumber"
                                        value={formData.credentialIdNumber}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Account Security</h3>
                            <Button
                                variant="outline"
                                className="w-full md:w-auto"
                                onClick={() => setIsChangePasswordOpen(true)}
                            >
                                <Key className="h-4 w-4 mr-2" />
                                Change Password
                            </Button>
                        </div>

                        <Separator />

                        {/* Identity Verification Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Identity Verification</h3>

                            {user.credentialIdImageUrl ? (
                                // Show uploaded ID document
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Uploaded ID Document</Label>
                                        <div className="border rounded-lg p-4 bg-green-50">
                                            <div className="flex items-start gap-4">
                                                <img
                                                    src={user.credentialIdImageUrl.split('"')[0]}
                                                    alt="ID Document"
                                                    className="max-w-xs rounded border"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 text-green-600 mb-2">
                                                        <CheckCircle className="h-5 w-5" />
                                                        <span className="font-medium">Verification Completed</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Your ID document has been successfully verified and processed.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={triggerIdUpload}
                                            disabled={isUploadingId}
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Re-upload ID Document
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                // Show upload interface
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>ID Document Upload</Label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                            <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                            <h4 className="text-lg font-medium mb-2">Upload your ID Document</h4>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Upload a clear photo of your government-issued ID. Our system will automatically extract your ID number.
                                            </p>
                                            <Button
                                                onClick={triggerIdUpload}
                                                disabled={isUploadingId}
                                                className="mb-2"
                                            >
                                                {isUploadingId ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Choose File
                                                    </>
                                                )}
                                            </Button>
                                            <p className="text-xs text-muted-foreground">
                                                Supported formats: JPG, PNG, GIF (Max 5MB)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleIdUpload}
                                className="hidden"
                            />
                        </div>

                    </CardContent>
                </Card>
            </div>

            <ChangePasswordDialog
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </div>
    )
}