
"use client";

import { UserCheck, ListChecks, MessagesSquare, ArrowRight, MapPin, CalendarDays } from 'lucide-react'; // Removed Users
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MOCK_RENTALS, MOCK_BIKES } from '@/lib/mock-data';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  link?: string;
  linkText?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, description, link, linkText }) => (
  <Card className="shadow-md hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {link && linkText && (
        <Button asChild variant="link" className="px-0 pt-2 text-xs h-auto">
          <Link href={link}>
            {linkText} <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      )}
    </CardContent>
  </Card>
);

export default function StaffDashboardPage() {
  const { user } = useAuth(); // Staff user details, e.g., assigned location if applicable

  const rentalStats = useMemo(() => {
    // In a real app, staff might only see rentals for their location
    // For this mock, we'll show all active/upcoming from MOCK_RENTALS
    const active = MOCK_RENTALS.filter(r => r.status === 'Active').length;
    const upcoming = MOCK_RENTALS.filter(r => r.status === 'Upcoming').length;
    return { active, upcoming };
  }, []);

  const totalLocations = useMemo(() => new Set(MOCK_BIKES.map(b => b.location)).size, []);

  const metricCards: MetricCardProps[] = [
    { title: "Active Rentals", value: rentalStats.active, icon: ListChecks, description: "Bikes currently out", link: "/staff/rentals", linkText: "Manage Rentals"},
    { title: "Upcoming Rentals", value: rentalStats.upcoming, icon: CalendarDays, description: "Scheduled pickups", link: "/staff/rentals", linkText: "Manage Rentals" },
    { title: "Managed Locations", value: totalLocations, icon: MapPin, description: "Across all sites" },
    { title: "Pending Support Messages", value: "3", icon: MessagesSquare, description: "New customer inquiries (mock)", link: "/staff/support-messages", linkText: "View Messages" },
  ];

   const navigationCardItems = [
    {
      title: "Rental Management",
      description: "Oversee active and upcoming bike rentals. Manage check-ins and check-outs.",
      href: "/staff/rentals",
      icon: ListChecks,
    },
    // {
    //   title: "User Directory",
    //   description: "Look up customer information and rental history.",
    //   href: "/staff/users",
    //   icon: Users, // Icon reference removed as Users is not imported
    // },
    {
      title: "Customer Support",
      description: "Respond to customer inquiries and provide assistance.",
      href: "/staff/support-messages",
      icon: MessagesSquare,
    },
  ];


  return (
    <div className="space-y-8">
      <div className="mb-8 p-6 bg-card rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-primary mb-2 flex items-center">
          <UserCheck className="w-10 h-10 mr-3 text-green-500" /> Staff Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">Welcome, {user?.name}! Manage daily operations efficiently.</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground/90">Quick Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((metric) => (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              description={metric.description}
              link={metric.link}
              linkText={metric.linkText}
            />
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-foreground/90">Key Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationCardItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card key={item.title} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <IconComponent className="w-6 h-6 mr-2 text-primary" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow p-6 pt-0">
                  <p className="text-sm text-muted-foreground mb-4 flex-grow">
                    {item.description}
                  </p>
                  <div className="mt-auto">
                    <Button asChild variant="outline" className="w-full">
                      <Link href={item.href} className="truncate">
                        Go to {item.title}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
