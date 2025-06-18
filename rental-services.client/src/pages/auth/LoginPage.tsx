// src/pages/auth/LoginPage.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bike, Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'
import { useToast } from '../../hooks/use-toast'
import { useAuth } from '../../contexts/auth-context'
import type {LoginRequest} from "../../contexts/auth-context";

export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const data: LoginRequest = {
            email: formData.email.trim(),
            password: formData.password.trim()
        }
        try {
            const success = await login(data);
            if (success) {
                toast({
                    title: "Login Successful",
                    description: "Welcome back to VroomVroom!",
                });
                navigate('/', {replace: true});
            } else {
                toast({
                    title: "Login Failed",
                    description: "Invalid email or password. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            toast({
                title: "Error",
                description: "An error occurred during login. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            // Option 1: Redirect to Google OAuth
            window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`

            // Option 2: If using Google Sign-In library (uncomment if you prefer this approach)
            /*
            const response = await fetch('/api/auth/google-signin', {
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
                // Handle successful login
                toast({
                    title: "Login Successful",
                    description: "Welcome back to VroomVroom!",
                })
                navigate('/')
            } else {
                throw new Error('Google login failed')
            }
            */
        } catch (error) {
            console.error('Google login error:', error)
            toast({
                title: "Google Login Failed",
                description: "Unable to sign in with Google. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsGoogleLoading(false)
        }
    }

    // Demo credentials helper
    // In auth0, it is renter@motorent.com - demo123456!
    const fillDemoCredentials = (userType: 'renter' | 'admin' | 'staff') => {
        const demoUsers = {
            renter: { email: 'renter@motorent.com', password: 'demo123' },
            admin: { email: 'admin@motorent.com', password: 'demo123' },
            staff: { email: 'staff@motorent.com', password: 'demo123' }
        }

        setFormData(demoUsers[userType])
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo */}
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center space-x-2">
                        <Bike className="h-8 w-8 text-primary" />
                        <span className="font-bold text-xl text-primary">VroomVroom.vn</span>
                    </Link>
                </div>

                {/* Login Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                        <CardDescription className="text-center">
                            Sign in to your account to continue your adventure
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Google Login Button */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full mb-4"
                            onClick={handleGoogleLogin}
                            disabled={isGoogleLoading || isLoading}
                        >
                            {isGoogleLoading ? (
                                <>Signing in with Google...</>
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
                                    Or continue with email
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link
                                        to="/auth/forgot-password"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
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

                            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                                {isLoading ? (
                                    <>Signing in...</>
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Sign In
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Demo Credentials */}
                        <div className="mt-6 pt-6 border-t">
                            <p className="text-sm text-muted-foreground text-center mb-3">
                                Demo Credentials:
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fillDemoCredentials('renter')}
                                    disabled={isLoading || isGoogleLoading}
                                >
                                    Renter
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fillDemoCredentials('admin')}
                                    disabled={isLoading || isGoogleLoading}
                                >
                                    Admin
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fillDemoCredentials('staff')}
                                    disabled={isLoading || isGoogleLoading}
                                >
                                    Staff
                                </Button>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <Link to="/auth/signup" className="text-primary hover:underline">
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}