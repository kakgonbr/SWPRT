// src/pages/auth/SignupPage.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bike, Eye, EyeOff, UserPlus } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'
import {type SignupRequest, useAuth} from '../../contexts/auth-context'
import { useToast } from '../../hooks/use-toast'

export default function SignupPage() {
    const navigate = useNavigate()
    const { register } = useAuth()
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleGoogleSignup = async () => {
        setIsGoogleLoading(true)

        try {
            // Option 1: Redirect to Google OAuth with signup intent
            window.location.href = `${import.meta.env.VITE_API_URL}/auth/google?signup=true`

            // Option 2: If using Google Sign-In library (uncomment if you prefer this approach)
            /*
            const response = await fetch('/api/auth/google-signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // Google token would be here
                })
            })
            
            if (response.ok) {
                const data = await response.json()
                toast({
                    title: "Account Created",
                    description: "Welcome to VroomVroom! Your account has been created successfully.",
                })
                navigate('/')
            } else {
                throw new Error('Google signup failed')
            }
            */
        } catch (error) {
            console.error('Google signup error:', error)
            toast({
                title: "Google Signup Failed",
                description: "Unable to sign up with Google. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsGoogleLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Password Mismatch",
                description: "Passwords do not match. Please check and try again.",
                variant: "destructive",
            })
            setIsLoading(false)
            return
        }

        if (formData.password.length < 6) {
            toast({
                title: "Weak Password",
                description: "Password must be at least 6 characters long.",
                variant: "destructive",
            })
            setIsLoading(false)
            return
        }

        try {
            const data : SignupRequest = {
                email: formData.email,
                name: formData.name,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
            };
            const success = await register(data)
            if (success) {
                toast({
                    title: "Account Created",
                    description: "Welcome to VroomVroom! Your account has been created successfully.",
                })
                navigate('/auth/login')
            } else {
                toast({
                    title: "Registration Failed",
                    description: "Failed to create account. Please try again.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred during registration. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
            <div className="w-full max-w-md space-y-6">
                {/* Logo */}
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center space-x-2">
                        <Bike className="h-8 w-8 text-primary" />
                        <span className="font-bold text-xl text-primary">VroomVroom.vn</span>
                    </Link>
                </div>

                {/* Signup Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
                        <CardDescription className="text-center">
                            Join VroomVroom and start your motorbike adventure
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Google Signup Button */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full mb-4"
                            onClick={handleGoogleSignup}
                            disabled={isGoogleLoading || isLoading}
                        >
                            {isGoogleLoading ? (
                                <>Signing up with Google...</>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </Button>

                        <div className="relative mb-4">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="w-full" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or create account with email
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone number</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="text"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                                {isLoading ? (
                                    <>Creating account...</>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Create Account
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link to="/auth/login" className="text-primary hover:underline">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}