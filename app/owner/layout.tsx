'use client';

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LoadingModal from "@/app/components/ui/LoadingModal";
import OwnerBottomNav from "@/app/components/OwnerBottomNav";
import { NotificationProvider } from "@/app/components/providers/NotificationProvider";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  const isOnboarding = pathname === '/owner/onboarding';
  const showBottomNav = pathname.startsWith('/owner') && !isOnboarding;

  useEffect(() => {
    const checkOnboarding = async () => {
      // 1. Get Session
      const { data: { session } } = await supabase.auth.getSession();
      
      /*
      if (!session) {
        router.push('/auth/login');
        return;
      }
      */

      // 2. Check metadata from session user
      const isComplete = session?.user?.user_metadata?.onboarding_complete;

      /*
      if (!isComplete && !isOnboarding) {
        router.push('/owner/onboarding');
        return; 
      } else if (isComplete && isOnboarding) {
        router.push('/owner');
        return; 
      }
      */
      
      setIsChecking(false);
    };

    checkOnboarding();
  }, [isOnboarding, router]);

  if (isChecking) return <LoadingModal isOpen={true} message="Authenticating..." />;

  return (
    <main className="min-h-screen bg-white relative overflow-x-hidden">
      
      {/* Background image layer - Styled to match your UserLayout */}
      <div 
        className="absolute inset-0 bg-[url('/backgrounds/tuloyphownerbg.svg')] bg-cover bg-fixed bg-center z-0" 
      />

      {/* Content Layer */}
      <div className="relative z-10">
        <NotificationProvider>
          <div className="relative z-10">
            {children}
          </div>
          
          {showBottomNav && (
            <Suspense fallback={null}>
              <OwnerBottomNav />
            </Suspense>
          )}
        </NotificationProvider>
      </div>
    </main>
  );
}