// src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react'
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
    Key
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

export default function ProfilePage() {
    const navigate = useNavigate()
    const { user, isAuthenticated, loading } = useAuth()
    const { toast } = useToast()

    const [isEditing, setIsEditing] = useState(false)
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
                            <p className="font-medium">{format(user.lastLogin ? "RANDOM MINS AGO" : "chim", "MMM d, yyyy")}</p>
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
                            <Button variant="outline" className="w-full md:w-auto">
                                <Key className="h-4 w-4 mr-2" />
                                Change Password
                            </Button>
                        </div>

                        {user.credentialIdImageUrl && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Identity Verification</h3>
                                    <div className="space-y-2">
                                        <Label>Uploaded ID Document</Label>
                                        <div className="border rounded-lg p-4">
                                            <img
                                                src={user.credentialIdImageUrl.split('"')[0]}
                                                alt="ID Document"
                                                className="max-w-xs rounded border"
                                            />
                                            <p className="text-sm text-muted-foreground mt-2">
                                                ID verification completed
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}