'use client';

import { MapPin, ChevronLeft, Heart } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import LoadingModal from "@/app/components/ui/LoadingModal";
import DormCard from "@/app/components/ui/DormCard";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SuccessModal from "@/app/components/ui/SuccessModal";

export default function SavedDormsPage() {
  const router = useRouter();
  const [savedDorms, setSavedDorms] = useState<any[]>([]);
  const [savedDormIds, setSavedDormIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [successModalConfig, setSuccessModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'success' as 'success' | 'info'
  });

  useEffect(() => {
    const fetchSavedDorms = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Fetch saved records with dorm details
        const { data, error } = await supabase
          .from('SavedDorm')
          .select(`
            dorm_id,
            DormWithRatings (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
           console.error('Detailed fetch error:', error);
           throw error;
        }

        const dorms = (data || [])
          .map((item: any) => item.DormWithRatings)
          .filter(Boolean) as any[];
        
        setSavedDorms(dorms);
        setSavedDormIds(dorms.map(d => d.id));
      } catch (err) {
        console.error('Error fetching saved dorms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedDorms();
  }, [router]);

  const handleToggleSave = async (e: React.MouseEvent, dormId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // In this page, we only handle Unsave
      const { error } = await supabase
        .from('SavedDorm')
        .delete()
        .eq('user_id', user.id)
        .eq('dorm_id', dormId);
      
      if (!error) {
        setSavedDormIds(prev => prev.filter(id => id !== dormId));
        setSavedDorms(prev => prev.filter(d => d.id !== dormId));
        setSuccessModalConfig({
          isOpen: true,
          title: 'Removed from Saved',
          message: 'The dormitory has been removed from your favorites.',
          variant: 'info'
        });
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const SavedDormsSkeleton = () => (
    <div className="grid grid-cols-1 gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-sm h-[320px] flex flex-col">
          <div className="h-48 sm:h-56 bg-gray-100 relative">
             <div className="absolute top-3 left-3 flex gap-1.5">
                <div className="w-16 h-6 bg-gray-200 rounded-full" />
                <div className="w-16 h-6 bg-gray-200 rounded-full" />
             </div>
             <div className="absolute top-3 right-3 w-8 h-8 bg-gray-200 rounded-full" />
             <div className="absolute bottom-3 left-3 w-20 h-8 bg-gray-200 rounded-xl" />
          </div>
          <div className="p-5 space-y-3">
             <div className="w-20 h-2 bg-gray-100 rounded-full" />
             <div className="w-48 h-6 bg-gray-200 rounded-lg" />
             <div className="w-32 h-3 bg-gray-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <SuccessModal 
        isOpen={successModalConfig.isOpen} 
        onClose={() => setSuccessModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={successModalConfig.title}
        message={successModalConfig.message}
        variant={successModalConfig.variant}
      />

      {/* Full Page Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply">
        <Image
          src="/backgrounds/tuloyphonboardingbg.svg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <main className="relative z-10 flex-1 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 mb-24 pt-6 px-4 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
           <button 
             onClick={() => router.back()}
             className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all"
           >
             <ChevronLeft className="w-5 h-5 text-neutral-dark" />
           </button>
           
           <div className="text-right">
             <h1 className="text-3xl font-black text-neutral-dark tracking-tight leading-none">Saved</h1>
             <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.15em] opacity-60">Your favorite dorms</p>
           </div>
        </div>

        {/* Results Section */}
        <div className="px-1 sm:px-0">
          {loading ? (
             <SavedDormsSkeleton />
          ) : savedDorms.length === 0 ? (
             <div className="py-20 text-center bg-white/60 rounded-[2.5rem] border-2 border-dashed border-gray-100 backdrop-blur-sm shadow-sm group">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                  <Heart className="w-8 h-8 text-gray-200" />
                </div>
                <p className="font-black text-neutral-dark uppercase tracking-widest text-xs mb-2">No saved dorms yet</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Start exploring and save your favorites!</p>
                <button 
                  onClick={() => router.push('/user')}
                  className="px-6 py-3 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                >
                  Browse Dorms
                </button>
             </div>
          ) : (
             <div className="grid grid-cols-1 gap-6">
               <AnimatePresence mode="popLayout">
                 {savedDorms.map(dorm => (
                   <motion.div
                     key={dorm.id}
                     layout
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, x: -20 }}
                     transition={{ duration: 0.3 }}
                   >
                     <DormCard 
                       dorm={dorm} 
                       isSaved={savedDormIds.includes(dorm.id)} 
                       onToggleSave={handleToggleSave}
                     />
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
          )}
        </div>
      </main>
    </>
  );
}
