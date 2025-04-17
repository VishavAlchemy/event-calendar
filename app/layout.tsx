'use client'
import { Geist, Geist_Mono } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"
import { useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ConvexReactClient } from "convex/react"
import { useAuth, useUser } from "@clerk/nextjs"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { ClerkProvider } from "@clerk/nextjs"
import { Sidebar } from "@/components/ui/sidebar"
import { FocusProvider } from "@/contexts/focus-context"
import { CalendarEvent } from "@/components/event-calendar"
import { FocusSession } from "@/components/focus-session"
import { FocusTimer } from "@/components/focus-timer"

const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})



function UserSync() {
  const { user } = useUser();
  const storeUser = useMutation(api.users.store);
  const checkUser = useQuery(api.users.checkUser, { clerkId: user?.id ?? "" });

  useEffect(() => {
    if (!user || checkUser !== null) return;

    storeUser({
      name: user.fullName ?? "",
      email: user.primaryEmailAddress?.emailAddress ?? "",
      clerkId: user.id,
      avatarUrl: user.imageUrl,
    });
  }, [user, storeUser, checkUser]);

  return null;
}

// This component will be rendered after the Convex provider is initialized
function AppContent({ children }: { children: React.ReactNode }) {
  const createEvent = useMutation(api.events.create);
  const { user } = useUser();

  const handleCreateCalendarEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    if (!user?.id) return;

    await createEvent({
      title: event.title,
      description: event.description || "",
      start: new Date(event.start).getTime(),
      end: new Date(event.end).getTime(),
      allDay: event.allDay || false,
      color: event.color || "violet",
      location: event.location || "",
      userId: user.id,
    });
  };

  return (
    <FocusProvider onCreateCalendarEvent={handleCreateCalendarEvent}>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <FocusTimer />
          </div>
          {children}
        </main>
      </div>
      <FocusSession />
      <Toaster />
    </FocusProvider>
  );
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >       
       <ClerkProvider>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <UserSync />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AppContent>
              {children}
            </AppContent>
          </ThemeProvider>
        </ConvexProviderWithClerk>
        </ClerkProvider>
      </body>
    </html>
  )
}
