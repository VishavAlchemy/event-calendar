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

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
        </ConvexProviderWithClerk>
        </ClerkProvider>

      </body>
    </html>
  )
}
