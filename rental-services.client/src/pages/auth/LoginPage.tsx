// src/pages/auth/LoginPage.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bike, Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useToast } from '../../hooks/use-toast'
import { useAuth } from '../../contexts/auth-context'

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const success = await login(formData.email, formData.password)

            if (success) {
                toast({
                    title: "Login Successful",
                    description: "Welcome back to VroomVroom!",
                })
                navigate('/')
            } else {
                toast({
                    title: "Login Failed",
                    description: "Invalid email or password. Please try again.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred during login. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Demo credentials helper
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
                                <Label htmlFor="password">Password</Label>
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

                            <Button type="submit" className="w-full" disabled={isLoading}>
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
                                >
                                    Renter
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fillDemoCredentials('admin')}
                                >
                                    Admin
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fillDemoCredentials('staff')}
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