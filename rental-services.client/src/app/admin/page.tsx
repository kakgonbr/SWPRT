
"use client";

import { ShieldAlert, Users as UsersIconLucide, UserPlus, ArrowRight, Bike as BikeIcon, ListChecks, CalendarClock, Eye, TrendingUp, Repeat, ShoppingBag, BarChartHorizontal, Activity, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MOCK_USERS, MOCK_BIKES, MOCK_RENTALS } from '@/lib/mock-data';
import { useMemo } from 'react';
import { startOfMonth, endOfMonth, isWithinInterval, subMonths, addMonths, format as formatDateFns, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
import type { User } from '@/lib/types';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, LineChart } from 'recharts';
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
  
  const userStats = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const currentQuarterStart = startOfQuarter(now);
    const currentQuarterEnd = endOfQuarter(now);
    const currentYearStart = startOfYear(now);
    const currentYearEnd = endOfYear(now);

    const newThisMonth = MOCK_USERS.filter(user => 
      isWithinInterval(new Date(user.createdAt), { start: currentMonthStart, end: currentMonthEnd })
    ).length;

    const newThisQuarter = MOCK_USERS.filter(user => 
      isWithinInterval(new Date(user.createdAt), { start: currentQuarterStart, end: currentQuarterEnd })
    ).length;

    const newThisYear = MOCK_USERS.filter(user =>
      isWithinInterval(new Date(user.createdAt), { start: currentYearStart, end: currentYearEnd })
    ).length;
    
    return { newThisMonth, newThisQuarter, newThisYear };
  }, []);

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
    const firstMonthOfPeriod = startOfMonth(subMonths(now, 11)); 
  
    const counts: { [key: string]: number } = {};
  
    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(firstMonthOfPeriod, i);
      const monthKey = formatDateFns(monthDate, 'yyyy-MM');
      counts[monthKey] = 0;
    }
  
    MOCK_USERS.forEach(user => {
      const signupDate = new Date(user.createdAt);
      if (signupDate >= firstMonthOfPeriod && signupDate <= endOfMonth(now)) {
        const monthKey = formatDateFns(signupDate, 'yyyy-MM');
        if (counts[monthKey] !== undefined) {
          counts[monthKey]++;
        }
      }
    });
    
    return Object.keys(counts)
      .sort()
      .map(monthKey => ({
        month: formatDateFns(new Date(monthKey + '-01T00:00:00'), 'MMM yy'),
        newUsers: counts[monthKey],
      }));
  }, []);

  const userChartConfig = {
    newUsers: {
      label: "New Users",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const monthlyRentalTrendsChartData = useMemo(() => {
    const now = new Date();
    const firstMonthOfPeriod = startOfMonth(subMonths(now, 11));
    const counts: { [key: string]: number } = {};

    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(firstMonthOfPeriod, i);
      const monthKey = formatDateFns(monthDate, 'yyyy-MM');
      counts[monthKey] = 0;
    }

    MOCK_RENTALS.forEach(rental => {
      const rentalStartDate = new Date(rental.startDate);
      // Check if the rental's start date falls within the 12-month window
      if (rentalStartDate >= firstMonthOfPeriod && rentalStartDate <= endOfMonth(now)) {
        const monthKey = formatDateFns(rentalStartDate, 'yyyy-MM');
        if (counts[monthKey] !== undefined) {
          counts[monthKey]++;
        }
      }
    });

    return Object.keys(counts)
      .sort()
      .map(monthKey => ({
        month: formatDateFns(new Date(monthKey + '-01T00:00:00'), 'MMM yy'),
        totalRentals: counts[monthKey],
      }));
  }, []);

  const rentalChartConfig = {
    totalRentals: {
      label: "Total Rentals",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;


  const metricCards: MetricCardProps[] = [
    { title: "Total Registered Users", value: totalUsers, icon: UsersIconLucide, description: "All-time user count", link: "/admin/users", linkText: "Manage Users"},
    { title: "New Users (This Month)", value: userStats.newThisMonth, icon: UserPlus, description: "Signed up this month" },
    { title: "New Users (This Quarter)", value: userStats.newThisQuarter, icon: UserPlus, description: "Signed up this quarter" },
    { title: "New Users (This Year)", value: userStats.newThisYear, icon: UserPlus, description: "Signed up this year" },
    { title: "Total Bikes", value: totalBikes, icon: BikeIcon, description: "Bikes in fleet", link: "/admin/fleet", linkText: "Manage Fleet" },
    { title: "Active Rentals", value: rentalStats.active, icon: ListChecks, description: "Currently rented out", link: "/admin/rentals/active", linkText: "View Active" },
    { title: "Upcoming Rentals", value: rentalStats.upcoming, icon: CalendarClock, description: "Future bookings", link: "/admin/rentals/upcoming", linkText: "View Upcoming" },
    { title: "Most Popular Bike", value: rentalStats.popularBikeName, icon: TrendingUp, description: "Based on rental count" },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
                <BarChartHorizontal className="w-5 h-5 mr-2 text-primary"/> User Registration Trends
            </CardTitle>
            <CardDescription>Monthly count of new user registrations for the last 12 months.</CardDescription>
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

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
                 <Activity className="w-5 h-5 mr-2 text-primary"/> Rental Volume Trends
            </CardTitle>
            <CardDescription>Monthly count of total rentals started for the last 12 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-2 md:p-4">
            <ChartContainer config={rentalChartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRentalTrendsChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
                  <Bar dataKey="totalRentals" fill="var(--color-totalRentals)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Management Sections removed */}
    </div>
  );
}


    