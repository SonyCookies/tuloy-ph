'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import BottomNav from '@/app/components/ui/BottomNav';
import { NotificationProvider } from '@/app/components/providers/NotificationProvider';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Temporarily disabled client-side guard
      /*
      if (!user) {
        router.push('/auth/login');
        return;
      }
      */
      setUser(user);
      
      const { data: profile } = await supabase
        .from('User')
        .select('onboarding_complete, role')
        .eq('id', user?.id)
        .single();
        
      /*
      if (profile?.role !== 'user') {
        router.push('/owner'); 
        return;
      }

      if (!profile?.onboarding_complete && !pathname.includes('/onboarding')) {
        router.push('/user/onboarding');
      }
      */
    };

    checkUser();
  }, [pathname, router]);

  const showBottomNav = pathname.startsWith('/user') && !pathname.includes('/onboarding');

  return (
    <main className="min-h-screen bg-white relative overflow-x-hidden">
  
      {/* Background image layer */}
      <div className="absolute inset-0 bg-[url('/backgrounds/tuloyphonboardingbg.svg')] bg-cover bg-fixed bg-center z-0" />

      {/* Your content */}
      <div className="relative z-10">

      <NotificationProvider>
        <div className="relative z-10">
          {children}
        </div>
        {showBottomNav && (
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        )}
      </NotificationProvider>
      </div>
    </main>
  );
}
