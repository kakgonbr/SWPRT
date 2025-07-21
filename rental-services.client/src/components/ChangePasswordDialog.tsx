import { useState } from 'react'
import { Eye, EyeOff, Key, Save, X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../components/ui/dialog'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useToast } from '../contexts/toast-context'
interface ChangePasswordDialogProps {
    isOpen: boolean
    onClose: () => void
}

export default function ChangePasswordDialog({ isOpen, onClose }: ChangePasswordDialogProps) {
    const { toast } = useToast()
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    })
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }))
    }

    const validateForm = () => {
        const newErrors = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
        let isValid = true

        // Validate current password
        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required'
            isValid = false
        }

        // Validate new password
        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required'
            isValid = false
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters long'
            isValid = false
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
            newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            isValid = false
        }

        // Validate confirm password
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your new password'
            isValid = false
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
            isValid = false
        }

        // Check if new password is same as current
        if (formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = 'New password must be different from current password'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/users/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            })

            if (response.ok) {
                toast({
                    title: "Password Changed Successfully",
                    description: "Your password has been updated. Please use your new password for future logins.",
                })
                handleClose()
            } else {
                const errorData = await response.json()
                if (response.status === 400 || response.status === 500) {
                    setErrors(prev => ({
                        ...prev,
                        currentPassword: 'Current password is incorrect'
                    }))
                } else {
                    throw new Error(errorData.message || 'Failed to change password')
                }
            }
        } catch (error) {
            console.error('Change password error:', error)
            toast({
                title: "Password Change Failed",
                description: "Failed to change password. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        })
        setErrors({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        })
        setShowPasswords({
            current: false,
            new: false,
            confirm: false
        })
        onClose()
    }

    const getPasswordStrength = (password: string) => {
        if (!password) return { strength: 0, label: '', color: '' }

        let strength = 0
        if (password.length >= 8) strength++
        if (/[a-z]/.test(password)) strength++
        if (/[A-Z]/.test(password)) strength++
        if (/\d/.test(password)) strength++
        if (/[^a-zA-Z\d]/.test(password)) strength++

        switch (strength) {
            case 0 - 1: return { strength: 1, label: 'Very Weak', color: 'bg-red-500' }
            case 2: return { strength: 2, label: 'Weak', color: 'bg-orange-500' }
            case 3: return { strength: 3, label: 'Fair', color: 'bg-yellow-500' }
            case 4: return { strength: 4, label: 'Good', color: 'bg-blue-500' }
            case 5: return { strength: 5, label: 'Strong', color: 'bg-green-500' }
            default: return { strength: 0, label: '', color: '' }
        }
    }

    const passwordStrength = getPasswordStrength(formData.newPassword)

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Change Password
                    </DialogTitle>
                    <DialogDescription>
                        Enter your current password and choose a new secure password for your account.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                type={showPasswords.current ? 'text' : 'password'}
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                placeholder="Enter your current password"
                                className={errors.currentPassword ? 'border-red-500' : ''}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => togglePasswordVisibility('current')}
                            >
                                {showPasswords.current ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {errors.currentPassword && (
                            <p className="text-sm text-red-600">{errors.currentPassword}</p>
                        )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type={showPasswords.new ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                placeholder="Enter your new password"
                                className={errors.newPassword ? 'border-red-500' : ''}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => togglePasswordVisibility('new')}
                            >
                                {showPasswords.new ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        {/* Password Strength Indicator */}
                        {formData.newPassword && (
                            <div className="space-y-1">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1 w-full rounded ${level <= passwordStrength.strength
                                                ? passwordStrength.color
                                                : 'bg-gray-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className={`text-xs ${passwordStrength.strength >= 4 ? 'text-green-600' :
                                    passwordStrength.strength >= 3 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                    Strength: {passwordStrength.label}
                                </p>
                            </div>
                        )}

                        {errors.newPassword && (
                            <p className="text-sm text-red-600">{errors.newPassword}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm your new password"
                                className={errors.confirmPassword ? 'border-red-500' : ''}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => togglePasswordVisibility('confirm')}
                            >
                                {showPasswords.confirm ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Password Requirements */}
                    <div className="text-xs text-muted-foreground space-y-1">
                        <p className="font-medium">Password requirements:</p>
                        <ul className="space-y-1 ml-2">
                            <li className={formData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                                • At least 8 characters long
                            </li>
                            <li className={/[a-z]/.test(formData.newPassword) ? 'text-green-600' : ''}>
                                • Contains lowercase letter (a-z)
                            </li>
                            <li className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : ''}>
                                • Contains uppercase letter (A-Z)
                            </li>
                            <li className={/\d/.test(formData.newPassword) ? 'text-green-600' : ''}>
                                • Contains number (0-9)
                            </li>
                        </ul>
                    </div>
                </form>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>Changing...</>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Change Password
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}