'use client';

import { ClerkProvider, useAuth, useUser } from '@clerk/nextjs';
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function UserSync() {
  const { user } = useUser();
  const storeUser = useMutation(api.users.store);
  const checkUser = useQuery(api.users.checkUser, { clerkId: user?.id ?? "" });

  useEffect(() => {
    // Only create user if Clerk user exists and we've checked but not found a Convex user
    if (!user || checkUser === undefined) return; // Skip if user is not loaded or if we're still loading user data
    
    if (checkUser === null) {
      // Only create user if not found in database
      storeUser({
        name: user.fullName ?? "",
        email: user.primaryEmailAddress?.emailAddress ?? "",
        clerkId: user.id,
        avatarUrl: user.imageUrl,
      });
    }
  }, [user, storeUser, checkUser]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!} signInUrl="/sign-in" signUpUrl="/sign-up">
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <UserSync />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
