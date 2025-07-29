import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bike, Mail, ArrowLeft, Lock } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useToast } from '../../contexts/toast-context'

export default function ForgotPasswordPage() {
    const { toast } = useToast()
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    //const [isEmailSent, setIsEmailSent] = useState(false)
    const [isOtpSent, setIsOtpSent] = useState(false)
    const [isOtpVerified, setIsOtpVerified] = useState(false)

    // Gửi yêu cầu reset password
    const handleSubmitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
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
                //setIsEmailSent(true)
                setIsOtpSent(true)
                toast({
                    title: "Reset Email Sent",
                    description: "Check your email for the OTP code.",
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

    // Xác thực OTP
    const handleSubmitOtp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp })
            })

            if (response.ok) {
                setIsOtpVerified(true)
                toast({
                    title: "OTP Verified",
                    description: "You can now set a new password.",
                })
            } else {
                const errorData = await response.json()
                toast({
                    title: "Error",
                    description: errorData.message || "Invalid OTP. Please try again.",
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

    // Đặt lại mật khẩu
    const handleSubmitNewPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp, newPassword })
            })

            if (response.ok) {
                toast({
                    title: "Password Reset Successful",
                    description: "Your password has been updated. You can now log in.",
                })
                setTimeout(() => {
                    window.location.href = '/auth/login'
                }, 2000)
            } else {
                const errorData = await response.json()
                toast({
                    title: "Error",
                    description: errorData.message || "Failed to reset password. Please try again.",
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

    // Giao diện nhập OTP
    if (isOtpSent && !isOtpVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
                <div className="w-full max-w-md space-y-6">
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
                            <CardTitle className="text-2xl">Enter OTP</CardTitle>
                            <CardDescription>
                                Enter the OTP code sent to <strong>{email}</strong>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitOtp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="otp">OTP Code</Label>
                                    <Input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        placeholder="Enter OTP code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>Verifying OTP...</>
                                    ) : (
                                        <>
                                            <Mail className="w-4 h-4 mr-2" />
                                            Verify OTP
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        //setIsEmailSent(false)
                                        setIsOtpSent(false)
                                        setOtp('')
                                    }}
                                >
                                    Try Another Email
                                </Button>
                                <Button asChild className="w-full mt-2">
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

    // Giao diện nhập mật khẩu mới
    if (isOtpVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center">
                        <Link to="/" className="inline-flex items-center space-x-2">
                            <Bike className="h-8 w-8 text-primary" />
                            <span className="font-bold text-xl text-primary">VroomVroom.vn</span>
                        </Link>
                    </div>

                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                                <Lock className="h-10 w-10 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl">Set New Password</CardTitle>
                            <CardDescription>
                                Enter your new password for <strong>{email}</strong>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitNewPassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>Resetting Password...</>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4 mr-2" />
                                            Reset Password
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
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

    // Giao diện nhập email
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
            <div className="w-full max-w-md space-y-6">
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
                            Enter your email address and we'll send you an OTP to reset your password
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmitEmail} className="space-y-4">
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
                                    <>Sending OTP...</>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Send OTP
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