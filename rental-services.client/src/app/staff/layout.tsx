
"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserCheck, LayoutDashboard, Menu, ListChecks, MessagesSquare } from 'lucide-react'; // Removed UsersIcon

interface StaffLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/staff', label: 'Overview', icon: LayoutDashboard },
  { href: '/staff/rentals', label: 'Rental Management', icon: ListChecks },
  // { href: '/staff/users', label: 'User Directory', icon: UsersIcon }, // Removed
  { href: '/staff/support-messages', label: 'Support Messages', icon: MessagesSquare },
];

export default function StaffLayout({ children }: StaffLayoutProps) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/auth/login?redirect=' + encodeURIComponent(pathname || '/staff'));
      } else if (user?.role !== 'staff' && user?.role !== 'admin') { // Admins can also access staff panel
        router.replace('/');
      }
    }
  }, [user, isAuthenticated, authLoading, router, pathname]);

  if (authLoading || !isAuthenticated || (user?.role !== 'staff' && user?.role !== 'admin')) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading or unauthorized...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r bg-card">
        <SidebarHeader className="p-4">
          <Link href="/staff" className="flex items-center text-primary hover:text-primary/80 transition-colors">
            <UserCheck className="h-7 w-7 mr-2" />
            <h2 className="text-xl font-semibold">Staff Panel</h2>
          </Link>
        </SidebarHeader>
        <Separator className="mb-2"/>
        <SidebarContent className="p-2">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant={pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/staff') ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </SidebarContent>
        <Separator className="mt-auto"/>
        <SidebarFooter className="p-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Back to Site</Link>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="p-4 md:p-6">
          <div className="flex justify-end mb-4 md:hidden">
             <SidebarTrigger asChild>
                <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Staff Sidebar</span>
                </Button>
            </SidebarTrigger>
          </div>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
