// src/components/layout/Header.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Bike,
    LogIn,
    UserPlus,
    MessageSquare,
    User,
    LogOut,
    Calendar,
    Settings,
    Shield,
    Menu,
    AlertTriangle,
    Heart
} from 'lucide-react'
import { Button } from '../ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { useChatWidget } from '../../contexts/chat-widget-context'
import { useAuth } from '../../contexts/auth-context'
import { useIsMobile } from '../../hooks/use-mobile'
import { ReportIssueDialog } from '../ReportIssueDialog'
import { FeedbackDialog } from '../FeedbackDialog'

export default function Header() {
    const { openChatWidget } = useChatWidget()
    const { user, isAuthenticated, logout } = useAuth()
    const isMobile = useIsMobile()
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isReportIssueOpen, setIsReportIssueOpen] = useState(false)
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)

    const handleLogout = () => {
        logout()
        setIsSheetOpen(false)
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
    }

    const NavigationLinks = () => (
        <>
            <Link
                to="/bikes"
                className="text-foreground/80 hover:text-foreground transition-colors"
                onClick={() => setIsSheetOpen(false)}
            >
                Browse Bikes
            </Link>
            <Link
                to="/location-finder"
                className="text-foreground/80 hover:text-foreground transition-colors"
                onClick={() => setIsSheetOpen(false)}
            >
                Find Locations
            </Link>
        </>
    )

    const AuthButtons = () => (
        <>
            {isAuthenticated && user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                            <Link to="/profile" onClick={() => setIsSheetOpen(false)}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <Link to="/rentals" onClick={() => setIsSheetOpen(false)}>
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>My Rentals</span>
                            </Link>
                        </DropdownMenuItem>

                        {/* Add Feedback and Report Issue to dropdown */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setIsFeedbackOpen(true)}>
                            <Heart className="mr-2 h-4 w-4" />
                            <span>Give Feedback</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => setIsReportIssueOpen(true)}>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            <span>Report Issue</span>
                        </DropdownMenuItem>

                        {(user.role === 'admin') && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/admin" onClick={() => setIsSheetOpen(false)}>
                                        <Shield className="mr-2 h-4 w-4" />
                                        <span>Admin Panel</span>
                                    </Link>
                                </DropdownMenuItem>
                            </>
                        )}

                        {(user.role === 'staff') && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/staff" onClick={() => setIsSheetOpen(false)}>
                                        <Shield className="mr-2 h-4 w-4" />
                                        <span>Staff Panel</span>
                                    </Link>
                                </DropdownMenuItem>
                            </>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <>
                    <Button variant="ghost" asChild size={isMobile ? "sm" : "default"}>
                        <Link to="/auth/login" onClick={() => setIsSheetOpen(false)}>
                            <LogIn className="h-4 w-4 mr-2" />
                            Login
                        </Link>
                    </Button>

                    <Button asChild size={isMobile ? "sm" : "default"}>
                        <Link to="/auth/signup" onClick={() => setIsSheetOpen(false)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Sign Up
                        </Link>
                    </Button>
                </>
            )}
        </>
    )

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2">
                    <Bike className="h-8 w-8 text-primary" />
                    <span className="font-bold text-xl text-primary">VroomVroom.vn</span>
                </Link>

                <div className="flex items-center space-x-4">
                    {/* Desktop Navigation Links */}
                    {!isMobile && (
                        <nav className="hidden md:flex items-center space-x-6">
                            <NavigationLinks />
                        </nav>
                    )}

                    {/* Chat Support Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={openChatWidget}
                        className="h-9 w-9"
                    >
                        <MessageSquare className="h-4 w-4" />
                        <span className="sr-only">Open chat support</span>
                    </Button>

                    {/* Feedback and Report Buttons - Desktop Only - REMOVED !isAuthenticated condition */}
                    {!isMobile && (
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsFeedbackOpen(true)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                                <Heart className="h-4 w-4 mr-1" />
                                Feedback
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsReportIssueOpen(true)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Report
                            </Button>
                        </div>
                    )}

                    {/* Desktop Auth */}
                    {!isMobile && <AuthButtons />}

                    {/* Mobile Menu */}
                    {isMobile && (
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <div className="flex flex-col space-y-6 mt-6">
                                    <nav className="flex flex-col space-y-4">
                                        <NavigationLinks />
                                    </nav>

                                    {/* Mobile Feedback/Report Buttons - REMOVED !isAuthenticated condition */}
                                    <div className="flex flex-col space-y-2 border-t pt-4">
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setIsFeedbackOpen(true)
                                                setIsSheetOpen(false)
                                            }}
                                            className="justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        >
                                            <Heart className="h-4 w-4 mr-2" />
                                            Give Feedback
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setIsReportIssueOpen(true)
                                                setIsSheetOpen(false)
                                            }}
                                            className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <AlertTriangle className="h-4 w-4 mr-2" />
                                            Report Issue
                                        </Button>
                                    </div>

                                    <div className="flex flex-col space-y-4">
                                        <AuthButtons />
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                </div>
            </div>

            {/* Dialog components */}
            <ReportIssueDialog
                isOpen={isReportIssueOpen}
                onClose={() => setIsReportIssueOpen(false)}
            />

            <FeedbackDialog
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
            />
        </header>
    )
}