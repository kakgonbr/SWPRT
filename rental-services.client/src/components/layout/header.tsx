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
    //@ts-ignore
    Settings,
    Shield,
    Menu,
    //@ts-ignore
    X
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

export default function Header() {
    const { openChatWidget } = useChatWidget()
    const { user, isAuthenticated, logout } = useAuth()
    const isMobile = useIsMobile()
    const [isSheetOpen, setIsSheetOpen] = useState(false)

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

                {/* Desktop Navigation */}
                {/*{!isMobile && (*/}
                {/*    <nav className="flex items-center space-x-6">*/}
                {/*        <NavigationLinks />*/}
                {/*    </nav>*/}
                {/*)}*/}

                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={openChatWidget}
                        className="h-9 w-9"
                    >
                        <MessageSquare className="h-4 w-4" />
                        <span className="sr-only">Open chat support</span>
                    </Button>

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

                                    <div className="flex flex-col space-y-4">
                                        <AuthButtons />
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                </div>
            </div>
        </header>
    )
}