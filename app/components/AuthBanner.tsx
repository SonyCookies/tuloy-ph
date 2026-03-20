'use client';

import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AuthBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsVisible(true);
        setShowBanner(true);
      }
    };
    checkUser();
  }, []);

  if (!isVisible || !showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] max-w-[340px] mx-auto animate-in fade-in slide-in-from-bottom-5 duration-500 font-sans">
      <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-gray-100 p-4 flex items-start gap-3 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-xl blur-2xl group-hover:bg-primary/10 transition-colors" />

        <div className="flex-shrink-0">
          <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shadow-inner">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        </div>

        <div className="flex-1 flex flex-col pt-0.5">
          <h3 className="text-base font-bold text-gray-900 leading-none mb-1">
            Find your ideal home
          </h3>
          <p className="text-gray-500 text-xs leading-tight mb-3">
             Join Tuloy PH to start finding the perfect dorm today.
          </p>
          
          <Link href="/auth/register" className="w-full bg-neutral-dark text-white py-2 rounded-xl text-xs font-bold hover:bg-black transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center shadow-lg shadow-neutral-dark/10">
            Create account
          </Link>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors z-10 -mr-1 -mt-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
