'use client';

import { 
  Search, 
  DollarSign, 
  SlidersHorizontal, 
  MapPin, 
  Navigation, 
  ChevronRight, 
  ArrowRight,
  TrendingDown,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DormCardSkeleton from "@/app/components/ui/DormCardSkeleton";
import DormCard from "@/app/components/ui/DormCard";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import NavigationBar from "@/app/components/NavigationBar";
import AuthBanner from "@/app/components/AuthBanner";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [dorms, setDorms] = useState<any[]>([]);
  const [savedDormIds, setSavedDormIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [genderFilter, setGenderFilter] = useState('');
  const [amenitiesFilter, setAmenitiesFilter] = useState<string[]>([]);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

  const availableAmenities = ['Wifi', 'Aircon', 'Bath', 'Kitchen', 'Gym', 'Laundry', 'Parking', 'Security', 'Water', 'Electricity'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Dorms
        const { data: dormData } = await supabase
          .from('DormWithRatings')
          .select('*')
          .eq('availability', 'available')
          .order('created_at', { ascending: false });

        setDorms(dormData || []);

        // 2. Fetch Saved Dorms (if logged in)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: savedData } = await supabase
            .from('SavedDorm')
            .select('dorm_id')
            .eq('user_id', user.id);

          if (savedData) setSavedDormIds(savedData.map(item => item.dorm_id));
        }

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredDorms = dorms.filter(dorm => {
    let match = true;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      match = match && (
        dorm.name?.toLowerCase().includes(q) ||
        dorm.description?.toLowerCase().includes(q) ||
        dorm.exact_address?.toLowerCase().includes(q)
      );
    }
    if (maxPrice) match = match && dorm.price <= Number(maxPrice);
    if (genderFilter) match = match && dorm.gender_policy === genderFilter;
    if (amenitiesFilter.length > 0) match = match && amenitiesFilter.every((a: string) => dorm.amenities?.includes(a));
    return match;
  });

  const toggleAmenity = (item: string) => {
    setAmenitiesFilter(prev => prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]);
  };

  const handleToggleSave = async (e: React.MouseEvent, dormId: string) => {
    e.stopPropagation();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to login or show alert
        router.push('/auth/login');
        return;
      }

      const isCurrentlySaved = savedDormIds.includes(dormId);
      if (isCurrentlySaved) {
        await supabase.from('SavedDorm').delete().eq('user_id', user.id).eq('dorm_id', dormId);
        setSavedDormIds(prev => prev.filter(id => id !== dormId));
      } else {
        await supabase.from('SavedDorm').insert([{ user_id: user.id, dorm_id: dormId }]);
        setSavedDormIds(prev => [...prev, dormId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <NavigationBar />
      
      <main className="relative z-10 max-w-2xl mx-auto flex-1 w-full animate-in fade-in slide-in-from-bottom-5 duration-1000 mb-24 pt-8 px-4">
        
        {/* HERO HEADER */}
        <div className="mb-10 text-center sm:text-left">
           <div className="flex items-center gap-2 mb-4 bg-primary/5 w-fit px-4 py-1.5 rounded-full border border-primary/10 mx-auto sm:mx-0">
             <Sparkles className="w-3.5 h-3.5 text-primary fill-primary" />
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Discovery Feed</span>
           </div>
           <h1 className="text-4xl font-black text-neutral-dark tracking-tight leading-[1.1] mb-2">
             Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">dream space.</span>
           </h1>
           <p className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.25em]">
             Hand-picked student housing solutions
           </p>
        </div>

        {/* SEARCH & FILTERS INTERFACE */}
        <div className="mb-12">
           <div className="bg-white rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.08)] border border-gray-100 p-6 relative group">
              <div className="space-y-4">
                 <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all shadow-inner">
                    <Search className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Where to live?</span>
                       <input 
                         type="text" 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         placeholder="Address, City, or Dorm name..." 
                         className="bg-transparent font-black tracking-tight text-neutral-dark outline-none placeholder:text-gray-300 text-base w-full"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setShowFiltersDropdown(!showFiltersDropdown)} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${maxPrice ? 'bg-primary/5 border-primary/20' : 'bg-gray-50/50 border-transparent hover:border-gray-100'}`}>
                       <div className={`p-2 rounded-xl bg-white shadow-sm ${maxPrice ? 'text-primary' : 'text-gray-400'}`}>
                         <DollarSign className="w-4 h-4" />
                       </div>
                       <div>
                         <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Price Range</span>
                         <span className="text-xs font-black text-neutral-dark uppercase tracking-tight truncate block">
                           {maxPrice ? `Under ₱${Number(maxPrice).toLocaleString()}` : 'Any Budget'}
                         </span>
                       </div>
                    </button>
                    <button onClick={() => setShowFiltersDropdown(!showFiltersDropdown)} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${amenitiesFilter.length > 0 ? 'bg-secondary/5 border-secondary/20' : 'bg-gray-50/50 border-transparent hover:border-gray-100'}`}>
                       <div className={`p-2 rounded-xl bg-white shadow-sm ${amenitiesFilter.length > 0 ? 'text-secondary' : 'text-gray-400'}`}>
                         <SlidersHorizontal className="w-4 h-4" />
                       </div>
                       <div>
                         <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Property Filters</span>
                         <span className="text-xs font-black text-neutral-dark uppercase tracking-tight truncate block">
                           {(amenitiesFilter.length + (genderFilter ? 1 : 0)) > 0 ? `${amenitiesFilter.length + (genderFilter ? 1 : 0)} Active` : 'All Types'}
                         </span>
                       </div>
                    </button>
                 </div>
              </div>

              <AnimatePresence>
                {showFiltersDropdown && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="pt-8 mt-8 border-t border-gray-100 space-y-8">
                       <div>
                          <div className="flex justify-between items-center mb-6">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Monthly Budget</label>
                             {maxPrice && <button onClick={() => setMaxPrice('')} className="text-[10px] font-black uppercase text-primary tracking-widest">Clear</button>}
                          </div>
                          <input type="range" min="0" max="25000" step="1000" value={maxPrice === '' ? 25000 : maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-primary" />
                          <div className="flex justify-between mt-4"><span className="text-[11px] font-black text-gray-300 uppercase">₱0</span><span className="text-sm font-black text-primary">₱{maxPrice === '' ? '25,000+' : Number(maxPrice).toLocaleString()}</span><span className="text-[11px] font-black text-gray-300 uppercase">₱25k+</span></div>
                       </div>
                       
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-4">Gender Policy</label>
                          <div className="flex gap-2">
                            {['', 'male', 'female', 'mixed'].map(id => (
                              <button key={id} onClick={() => setGenderFilter(id)} className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${genderFilter === id ? 'bg-neutral-dark text-white border-neutral-dark shadow-xl' : 'bg-gray-50/50 border-transparent text-gray-400 hover:bg-gray-100'}`}>
                                {id || 'Any'}
                              </button>
                            ))}
                          </div>
                       </div>

                       <div>
                          <div className="flex justify-between items-center mb-4">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Amenities</label>
                             {amenitiesFilter.length > 0 && <button onClick={() => setAmenitiesFilter([])} className="text-[10px] font-black uppercase text-primary tracking-widest">Reset All</button>}
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                             {availableAmenities.map(item => {
                               const isSelected = amenitiesFilter.includes(item);
                               return (
                                 <button 
                                   key={item} 
                                   onClick={() => toggleAmenity(item)} 
                                   className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${isSelected ? 'bg-secondary text-white border-secondary shadow-lg' : 'bg-gray-50/50 border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                 >
                                   {item}
                                 </button>
                               );
                             })}
                          </div>
                       </div>
                       
                       <button onClick={() => setShowFiltersDropdown(false)} className="w-full py-5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]">
                         Apply Filters & View Results
                       </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* RESULTS FEED */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <div className="flex items-center justify-between mb-8 px-1">
              <h2 className="text-xl font-black text-neutral-dark tracking-tight uppercase tracking-widest text-sm flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                Available Spaces
              </h2>
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest whitespace-nowrap">
                {loading ? '---' : filteredDorms.length} Matches Found
              </span>
           </div>
           
           {loading ? (
             <div className="grid grid-cols-1 gap-10">
               {[1, 2, 3].map(i => <DormCardSkeleton key={i} />)}
             </div>
           ) : filteredDorms.length === 0 ? (
              <div className="py-24 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                 <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-50 flex items-center justify-center mx-auto mb-6">
                    <Navigation className="w-10 h-10 text-gray-200" />
                 </div>
                 <h3 className="text-sm font-black text-neutral-dark uppercase tracking-widest mb-2">No listings found</h3>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Try adjusting your budget or filters</p>
                 <button onClick={() => { setSearchTerm(''); setMaxPrice(''); setGenderFilter(''); setAmenitiesFilter([]); }} className="px-8 py-3.5 bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95">Reset Exploration</button>
              </div>
           ) : (
              <div className="grid grid-cols-1 gap-10">
                {filteredDorms.map(dorm => (
                  <DormCard 
                    key={dorm.id} 
                    dorm={dorm} 
                    isSaved={savedDormIds.includes(dorm.id)} 
                    onToggleSave={handleToggleSave} 
                  />
                ))}
              </div>
           )}
        </div>
      </main>

      <AuthBanner />
    </div>
  );
}
