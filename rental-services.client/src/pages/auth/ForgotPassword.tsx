import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bike, Mail, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useToast } from '../../contexts/toast-context'
export default function ForgotPasswordPage() {
    const { toast } = useToast()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isEmailSent, setIsEmailSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            })

            if (response.ok) {
                setIsEmailSent(true)
                toast({
                    title: "Reset Email Sent",
                    description: "Check your email for password reset instructions.",
                })
            } else {
                const errorData = await response.json()
                toast({
                    title: "Error",
                    description: errorData.message || "Failed to send reset email. Please try again.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isEmailSent) {
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

                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                                <Mail className="h-10 w-10 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl">Check Your Email</CardTitle>
                            <CardDescription>
                                We've sent a password reset link to <strong>{email}</strong>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>

                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        setIsEmailSent(false)
                                        setEmail('')
                                    }}
                                >
                                    Try Another Email
                                </Button>

                                <Button asChild className="w-full">
                                    <Link to="/auth/login">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Login
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
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

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Forgot Password?</CardTitle>
                        <CardDescription className="text-center">
                            Enter your email address and we'll send you a link to reset your password
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>Sending Reset Link...</>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Send Reset Link
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                to="/auth/login"
                                className="text-sm text-primary hover:underline inline-flex items-center"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}