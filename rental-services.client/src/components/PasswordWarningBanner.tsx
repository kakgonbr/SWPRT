// src/components/PasswordWarningBanner.tsx
import { useState, useEffect } from 'react'
import { AlertTriangle, X, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { useAuth } from '../contexts/auth-context'

export default function PasswordWarningBanner() {
    const { user } = useAuth()
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        // Check if banner was previously dismissed for this user
        if (user?.userId) {
            const dismissed = localStorage.getItem(`password-banner-dismissed-${user.userId}`)
            setIsDismissed(dismissed === 'true')
        }
    }, [user?.userId])

    const handleDismiss = () => {
        setIsDismissed(true)
        if (user?.userId) {
            localStorage.setItem(`password-banner-dismissed-${user.userId}`, 'true')
        }
    }

    // Clean up dismissed state when user sets a password
    useEffect(() => {
        if (user?.passwordHash !== null && user?.userId) {
            localStorage.removeItem(`password-banner-dismissed-${user.userId}`)
        }
    }, [user?.passwordHash, user?.userId])

    // Don't show if user is not logged in, has a password, or banner is dismissed
    if (!user || user.passwordHash !== null || isDismissed) {
        return null
    }

    return (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">
                                Security Notice: Please set a password for your account to ensure full access to all features.
                            </span>
                            <Button
                                asChild
                                variant="link"
                                size="sm"
                                className="text-amber-700 hover:text-amber-900 p-0 h-auto underline"
                            >
                                <Link to="/profile">
                                    <Settings className="h-3 w-3 mr-1" />
                                    Go to Profile
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDismiss}
                        className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 h-6 w-6 p-0 flex-shrink-0"
                    >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Dismiss</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}