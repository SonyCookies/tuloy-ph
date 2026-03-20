'use client';

import { Home, List, Plus, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNotifications } from '@/app/components/providers/NotificationProvider';

export default function OwnerBottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  const navItems = [
    { label: "Home", icon: Home, href: "/owner" },
    { label: "Manage", icon: List, href: "/owner/listings" },
    { label: "Post", icon: Plus, href: "/owner/add", isCentral: true },
    { label: "Messages", icon: MessageSquare, href: "/owner/messages" },
    { label: "Profile", icon: User, href: "/owner/profile" },
  ];

  return (
    <div className="bottom-nav-container fixed bottom-0 left-0 right-0 z-50 flex justify-center animate-in fade-in slide-in-from-bottom-5 duration-1000">
      <div className="relative w-full max-w-2xl">
        <nav className="bg-white rounded-t-[1.5rem] w-full h-20 flex items-center justify-around px-2 shadow-[0_-20px_60px_rgba(0,0,0,0.12)] border-t border-gray-100 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.isCentral) {
              return (
                <div key={item.label} className="flex-1 flex flex-col items-center">
                  <div className="relative -top-10 flex flex-col items-center gap-2 group">
                    <Link 
                      href={item.href}
                      className="w-20 h-20 rounded-full bg-secondary shadow-2xl shadow-secondary/40 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 group-hover:rotate-6 border-[6px] border-white"
                    >
                      <Icon className="w-9 h-9" />
                    </Link>
                    <span className="absolute -bottom-6 text-[9px] font-black text-neutral-dark/60 uppercase tracking-widest whitespace-nowrap">{item.label}</span>
                  </div>
                </div>
              );
            }

            return (
              <Link 
                key={item.label} 
                href={item.href} 
                className="flex-1 flex flex-col items-center gap-1.5 transition-all hover:scale-110 active:scale-95 group"
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-secondary' : 'text-neutral-dark/50 group-hover:text-neutral-dark/70'}`} />
                  {item.label === 'Messages' && unreadCount > 0 && (
                    <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-black rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 shadow-[0_0_10px_rgba(239,68,68,0.5)] border-2 border-white pointer-events-none animate-in zoom-in">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-secondary' : 'text-neutral-dark/50 group-hover:text-neutral-dark/70'}`}>
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
