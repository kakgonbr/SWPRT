
"use client"; 

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { ChatWidgetProvider } from '@/contexts/chat-widget-context'; // Import the new provider
import { Toaster } from '@/components/ui/toaster';
import React from 'react'; 
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ChatWidget from '@/components/chat/chat-widget';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// export const metadata: Metadata = {
//   title: 'VroomVroom.vn',
//   description: 'Your next adventure on two wheels, from VroomVroom.vn.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Chat widget state is now managed by ChatWidgetProvider

  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <ChatWidgetProvider> {/* Wrap with ChatWidgetProvider */}
            <Header /> {/* Header no longer needs toggleChatWidget prop */}
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
            <ChatWidget /> {/* ChatWidget no longer needs isOpen or onClose props */}
            <Toaster />
          </ChatWidgetProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
