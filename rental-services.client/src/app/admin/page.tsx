
"use client";

import { ShieldAlert, Users as UsersIconLucide, UserPlus, ArrowRight, Bike as BikeIcon, ListChecks, CalendarClock, Eye, TrendingUp, Repeat, ShoppingBag, BarChartHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MOCK_USERS, MOCK_BIKES, MOCK_RENTALS } from '@/lib/mock-data';
import { useMemo } from 'react';
import { startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isWithinInterval, subMonths, addMonths, format as formatDateFns } from 'date-fns';
import type { User } from '@/lib/types';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";

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


export default function AdminOverviewPage() {
  const totalUsers = useMemo(() => MOCK_USERS.length, []);
  const totalBikes = useMemo(() => MOCK_BIKES.length, []);
  
  const rentalStats = useMemo(() => {
    const active = MOCK_RENTALS.filter(r => r.status === 'Active').length;
    const upcoming = MOCK_RENTALS.filter(r => r.status === 'Upcoming').length;
    const completed = MOCK_RENTALS.filter(r => r.status === 'Completed').length;
    
    const bikeRentalCounts: Record<string, number> = {};
    MOCK_RENTALS.forEach(rental => {
      bikeRentalCounts[rental.bikeId] = (bikeRentalCounts[rental.bikeId] || 0) + 1;
    });

    let popularBikeName = "N/A";
    if (Object.keys(bikeRentalCounts).length > 0) {
      const mostPopularId = Object.keys(bikeRentalCounts).reduce((a, b) => bikeRentalCounts[a] > bikeRentalCounts[b] ? a : b);
      const popularBike = MOCK_BIKES.find(bike => bike.id === mostPopularId);
      popularBikeName = popularBike ? popularBike.name : "Unknown Bike";
    }
    
    return { active, upcoming, completed, popularBikeName };
  }, []);

  const monthlyUserSignupsChartData = useMemo(() => {
    const now = new Date();
    // Go back 11 months to get the start of the 12-month period
    const firstMonthOfPeriod = startOfMonth(subMonths(now, 11)); 
  
    const counts: { [key: string]: number } = {};
  
    // Initialize counts for the last 12 months
    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(firstMonthOfPeriod, i);
      const monthKey = formatDateFns(monthDate, 'yyyy-MM');
      counts[monthKey] = 0;
    }
  
    MOCK_USERS.forEach(user => {
      const signupDate = new Date(user.createdAt);
      // Ensure the user was created within the 12-month window
      if (signupDate >= firstMonthOfPeriod && signupDate <= endOfMonth(now)) {
        const monthKey = formatDateFns(signupDate, 'yyyy-MM');
        if (counts[monthKey] !== undefined) {
          counts[monthKey]++;
        }
      }
    });
    
    const chartData = Object.keys(counts)
      .sort() // Sort keys to ensure months are in chronological order
      .map(monthKey => ({
        month: formatDateFns(new Date(monthKey + '-01T00:00:00'), 'MMM yy'), // Add time to avoid timezone issues with just yyyy-MM
        newUsers: counts[monthKey],
      }));
      
    return chartData;
  }, []);

  const userChartConfig = {
    newUsers: {
      label: "New Users",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;


  const metricCards: MetricCardProps[] = [
    { title: "Total Registered Users", value: totalUsers, icon: UsersIconLucide, description: "All-time user count", link: "/admin/users", linkText: "Manage Users"},
    { title: "Total Bikes", value: totalBikes, icon: BikeIcon, description: "Bikes in fleet", link: "/admin/fleet", linkText: "Manage Fleet" },
    { title: "Active Rentals", value: rentalStats.active, icon: ListChecks, description: "Currently rented out", link: "/admin/rentals/active", linkText: "View Active" },
    { title: "Upcoming Rentals", value: rentalStats.upcoming, icon: CalendarClock, description: "Future bookings", link: "/admin/rentals/upcoming", linkText: "View Upcoming" },
    { title: "Most Popular Bike", value: rentalStats.popularBikeName, icon: TrendingUp, description: "Based on rental count" },
    { title: "Completed Rentals", value: rentalStats.completed, icon: Repeat, description: "Total past rentals" },
    { title: "Total Bookings", value: MOCK_RENTALS.length, icon: ShoppingBag, description: "All-time rental bookings" },
    { title: "Website Visits", value: "1,234", icon: Eye, description: "This month (placeholder)" },
  ];

  const navigationCardItems = [
    {
      title: "Fleet Management",
      description: "View, add, edit, or remove bikes from the catalog.",
      details: "Manage all motorbikes available for rent. Update details, availability, and pricing.",
      href: "/admin/fleet",
      linkText: "Fleet Management",
      icon: BikeIcon,
    },
    {
      title: "Active Rentals",
      description: "Monitor bikes currently rented out to customers.",
      details: "See which bikes are on the road, who rented them, and when they are due back.",
      href: "/admin/rentals/active",
      linkText: "Active Rentals",
      icon: ListChecks,
    },
    {
      title: "Upcoming Rentals",
      description: "Track future rental bookings and prepare accordingly.",
      details: "Stay ahead by viewing scheduled pickups and ensuring bike availability.",
      href: "/admin/rentals/upcoming",
      linkText: "Upcoming Rentals",
      icon: CalendarClock,
    },
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions.",
      details: "View all registered users, modify their roles, or remove accounts as needed.",
      href: "/admin/users",
      linkText: "User Management",
      icon: UsersIconLucide,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="mb-8 p-6 bg-card rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-primary mb-2 flex items-center">
          <ShieldAlert className="w-10 h-10 mr-3 text-destructive" /> Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">Welcome to the VroomVroom.vn admin panel. Get an overview of your operations and navigate to management sections.</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground/90">Key Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground/90 flex items-center">
          <BarChartHorizontal className="w-6 h-6 mr-2 text-primary"/> User Registration Trends
        </h2>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">New Users Over Last 12 Months</CardTitle>
            <CardDescription>Monthly count of new user registrations.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-2 md:p-4">
            <ChartContainer config={userChartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyUserSignupsChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                    fontSize={12}
                    allowDecimals={false} 
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="newUsers" fill="var(--color-newUsers)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-foreground/90">Management Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {navigationCardItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card key={item.title} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <IconComponent className="w-6 h-6 mr-2 text-primary" />
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow p-6 pt-0">
                  <p className="text-sm text-muted-foreground mb-4 flex-grow">
                    {item.details}
                  </p>
                  <div className="mt-auto">
                    <Button asChild variant="outline" className="w-full">
                      <Link href={item.href} className="truncate">
                        {item.linkText}
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


    