
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
import { ShieldAlert, Bike as BikeIconLucide, ListChecks, CalendarClock, LayoutDashboard, Menu, Users } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/fleet', label: 'Fleet Management', icon: BikeIconLucide },
  { href: '/admin/rentals/active', label: 'Active Rentals', icon: ListChecks },
  { href: '/admin/rentals/upcoming', label: 'Upcoming Rentals', icon: CalendarClock },
  { href: '/admin/users', label: 'User Management', icon: Users },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/auth/login?redirect=' + encodeURIComponent(pathname || '/admin'));
      } else if (user?.role !== 'admin') {
        router.replace('/');
      }
    }
  }, [user, isAuthenticated, authLoading, router, pathname]);

  if (authLoading || !isAuthenticated || user?.role !== 'admin') {
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
          <Link href="/admin" className="flex items-center text-primary hover:text-primary/80 transition-colors">
            <ShieldAlert className="h-7 w-7 mr-2" />
            <h2 className="text-xl font-semibold">Admin Panel</h2>
          </Link>
        </SidebarHeader>
        <Separator className="mb-2"/>
        <SidebarContent className="p-2">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant={pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin') ? 'secondary' : 'ghost'}
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
                    <span className="sr-only">Toggle Admin Sidebar</span>
                </Button>
            </SidebarTrigger>
          </div>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
