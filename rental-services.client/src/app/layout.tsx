
"use client"; 

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/toaster';
import React, { useState, useEffect } from 'react'; 
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
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);

  const toggleChatWidget = () => {
    setIsChatWidgetOpen(prev => !prev);
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <Header toggleChatWidget={toggleChatWidget} />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <ChatWidget isOpen={isChatWidgetOpen} onClose={() => setIsChatWidgetOpen(false)} />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
