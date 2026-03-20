'use client';

import Image from "next/image";
import { LogOut, LayoutDashboard, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NavigationBar() {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 flex items-center justify-between font-sans transition-all duration-300">
      <Link href="/" className="relative w-28 h-14">
        <Image
          src="/logo/tuloyphlogolandscape.svg"
          alt="Tuloy PH Logo"
          fill
          className="object-contain"
        />
      </Link>

      <div className="flex items-center gap-4 sm:gap-6 text-neutral-dark">
        {!user ? (
          <Link href="/auth/login" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-all">
            Sign In
          </Link>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border border-gray-100 group-hover:border-primary/30 transition-all">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline-block">Account</span>
            </button>

            {showDropdown && (
              <div className="absolute top-12 right-0 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 animate-in fade-in zoom-in-95 duration-200">
                <Link
                  href="/user"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-[10px] font-black uppercase tracking-widest text-neutral-dark transition-all"
                  onClick={() => setShowDropdown(false)}
                >
                  <LayoutDashboard className="w-4 h-4 text-secondary" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-[10px] font-black uppercase tracking-widest text-red-500 transition-all text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
