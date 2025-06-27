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
    Shield,
    Menu,
    Heart,
    Bug,
    Wrench
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
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { useChatWidget } from '../../contexts/chat-widget-context'
import { useAuth } from '../../contexts/auth-context'
import { useIsMobile } from '../../hooks/use-mobile'
import { FeedbackDialog } from '../FeedbackDialog'
import GeneralReportDialog from '../customer/GeneralReportDialog'
import ReportIssueDialog from '../customer/ReportIssueDialog'

export default function Header() {
    const { openChatWidget } = useChatWidget()
    const { user, logout } = useAuth()
    const isMobile = useIsMobile()
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    // Bike issue report for header button
    const [isBikeReportOpen, setIsBikeReportOpen] = useState(false)
    // Website issue report for dropdown
    const [isWebsiteReportOpen, setIsWebsiteReportOpen] = useState(false)
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
    console.log('----- User in header:', user);

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

    const AuthButtons = () => (
        <>
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                {/*<AvatarImage src={user.avatarUrl} alt={user.name} />*/}
                                <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.fullName}</p>
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

                        {/* Feedback and Website Report in dropdown */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setIsFeedbackOpen(true)}>
                            <Heart className="mr-2 h-4 w-4" />
                            <span>Give Feedback</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => setIsWebsiteReportOpen(true)}>
                            <Bug className="mr-2 h-4 w-4" />
                            <span>Report Website Issue</span>
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
                    <span className="font-bold text-xl text-primary">VroomVroom.click</span>
                </Link>

                <div className="flex items-center space-x-4">
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

                    {/* Feedback and Bike Report Buttons - Desktop Only */}
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

                            {/* Changed to Bike Report */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsBikeReportOpen(true)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Wrench className="h-4 w-4 mr-1" />
                                Report Bike Issue
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
                                    {/* Mobile Feedback/Report Buttons */}
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

                                        {/* Changed to Bike Report for mobile header */}
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setIsBikeReportOpen(true)
                                                setIsSheetOpen(false)
                                            }}
                                            className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Wrench className="h-4 w-4 mr-2" />
                                            Report Bike Issue
                                        </Button>

                                        {/* Website report in mobile menu (separate from avatar dropdown) */}
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setIsWebsiteReportOpen(true)
                                                setIsSheetOpen(false)
                                            }}
                                            className="justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                        >
                                            <Bug className="h-4 w-4 mr-2" />
                                            Report Website Issue
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
            <FeedbackDialog
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
            />

            {/* Bike Issue Report Dialog - for header button */}
            <ReportIssueDialog
                isOpen={isBikeReportOpen}
                onClose={() => setIsBikeReportOpen(false)}
                rental={null} // No specific rental from header
                userInfo={{
                    id: String(user?.userId) || '',
                    name: user?.fullName || '',
                    email: user?.email || ''
                }}
            />

            {/* Website Issue Report Dialog - for dropdown */}
            <GeneralReportDialog
                isOpen={isWebsiteReportOpen}
                onClose={() => setIsWebsiteReportOpen(false)}
                userInfo={{
                    id: String(user?.userId) || '',
                    name: user?.fullName || '',
                    email: user?.email || ''
                }}
            />
        </header>
    )
}