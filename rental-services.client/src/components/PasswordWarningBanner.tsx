// src/components/PasswordWarningBanner.tsx
import { useState, useEffect } from 'react'
import { AlertTriangle, Settings, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { useAuth } from '../contexts/auth-context'

export default function PasswordWarningBanner() {
    const { user, hasPassword } = useAuth()
    const [isDismissed, setIsDismissed] = useState(false)

    // Check if banner was dismissed for this user
    useEffect(() => {
        if (user) {
            const dismissed = localStorage.getItem(`passwordBannerDismissed_${user.userId}`)
            setIsDismissed(dismissed === 'true')
        }
    }, [user])

    const handleDismiss = () => {
        if (user) {
            localStorage.setItem(`passwordBannerDismissed_${user.userId}`, 'true')
            setIsDismissed(true)
        }
    }

    // Don't show if user is not logged in, has a password, or has dismissed the banner
    if (!user || hasPassword || isDismissed) {
        return null
    }

    return (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 sticky top-16 z-40">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 flex-1">
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
                        className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 ml-2 flex-shrink-0"
                        aria-label="Dismiss banner"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}