'use client';

import {
  LayoutDashboard,
  Heart,
  MessageSquare,
  User,
  Home
} from 'lucide-react';
import { useNotifications } from '@/app/components/providers/NotificationProvider';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { unreadCount } = useNotifications();
  const [isExternallyHidden, setIsExternallyHidden] = useState(false);

  const isChatOpen = pathname.startsWith('/user/messages') && searchParams.get('id');

  useEffect(() => {
    // Check for a global class on the body as a way for child components (like modals) 
    // to signal that the nav should be hidden.
    const observer = new MutationObserver(() => {
      setIsExternallyHidden(document.body.classList.contains('hide-bottom-nav'));
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Initial check
    setIsExternallyHidden(document.body.classList.contains('hide-bottom-nav'));

    return () => observer.disconnect();
  }, []);

  if (isChatOpen || isExternallyHidden) return null;

  const navItems = [
    { icon: Home, label: 'Home', href: '/user' },
    { icon: Heart, label: 'Saved', href: '/user/saved' },
    { icon: MessageSquare, label: 'Messages', href: '/user/messages' },
    { icon: User, label: 'Profile', href: '/user/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center animate-in fade-in slide-in-from-bottom-5 duration-1000">
      <div className="relative w-full max-w-2xl">
        <nav className="bg-white rounded-t-[1.5rem] w-full h-20 flex items-center justify-around px-2 shadow-[0_-20px_60px_rgba(0,0,0,0.12)] border-t border-gray-100 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex-1 flex flex-col items-center gap-1.5 transition-all hover:scale-110 active:scale-95 group"
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-primary' : 'text-neutral-dark/50 group-hover:text-neutral-dark/70'}`} />
                  {item.label === 'Messages' && unreadCount > 0 && (
                    <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-black rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 shadow-[0_0_10px_rgba(239,68,68,0.5)] border-2 border-white pointer-events-none animate-in zoom-in">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-primary' : 'text-neutral-dark/50 group-hover:text-neutral-dark/70'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
