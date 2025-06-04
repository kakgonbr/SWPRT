
"use client";

import Link from 'next/link';
import { Bike, LogIn, LogOut, UserCircle, UserPlus, LayoutDashboard, MessageSquare, History, ShoppingCart, SettingsIcon, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useChatWidget } from '@/contexts/chat-widget-context'; // Import useChatWidget
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// HeaderProps interface is no longer needed as toggleChatWidget is removed
// interface HeaderProps {
//   toggleChatWidget: () => void;
// }

export default function Header(/*{ toggleChatWidget }: HeaderProps*/) {
  const { user, logout, isAuthenticated } = useAuth();
  const { openChatWidget } = useChatWidget(); // Get openChatWidget from context

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
          <Bike className="h-8 w-8" />
          <span className="font-bold text-xl">VroomVroom.vn</span>
        </Link>
        <nav className="flex items-center space-x-2 md:space-x-4 lg:space-x-6">
          <Link href="/bikes" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors px-1 py-1 md:px-2">
            Bikes
          </Link>
          <Button
            variant="ghost"
            onClick={() => openChatWidget()} // Use openChatWidget from context
            className="px-1 py-1 md:px-2 text-sm font-medium text-foreground/70 hover:text-primary hover:bg-transparent"
          >
            <MessageSquare className="h-5 w-5 md:mr-1.5"/>
            <span className="hidden md:inline">Support</span>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                 {(user?.role === 'staff' || user?.role === 'admin') && ( 
                  <DropdownMenuItem asChild>
                    <Link href="/staff" className="flex items-center">
                      <UserCheck className="mr-2 h-4 w-4" /> 
                      Staff Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/rentals" className="flex items-center">
                    <History className="mr-2 h-4 w-4" />
                    Rental History
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/checkout" className="flex items-center">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart/Checkout
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="space-x-1 md:space-x-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">
                  <LogIn className="mr-1 md:mr-2 h-4 w-4" /> Login
                </Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link href="/auth/signup">
                  <UserPlus className="mr-1 md:mr-2 h-4 w-4" /> Sign Up
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
