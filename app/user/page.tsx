'use client';

import { 
  Search, 
  DollarSign, 
  SlidersHorizontal, 
  MapPin, 
  Sparkles, 
  Navigation, 
  MessageCircle, 
  Calendar, 
  User, 
  ChevronRight, 
  Heart, 
  Bell,
  Clock,
  Home,
  CheckCircle2,
  ArrowRight,
  TrendingDown
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DormCardSkeleton from "@/app/components/ui/DormCardSkeleton";
import DormCard from "@/app/components/ui/DormCard";
import Link from "next/link";
import SuccessModal from "@/app/components/ui/SuccessModal";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, parseISO } from "date-fns";

export default function UserDashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [dorms, setDorms] = useState<any[]>([]);
  const [savedDormIds, setSavedDormIds] = useState<string[]>([]);
  const [upcomingVisits, setUpcomingVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [genderFilter, setGenderFilter] = useState('');
  const [amenitiesFilter, setAmenitiesFilter] = useState<string[]>([]);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  const [successModalConfig, setSuccessModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'success' as 'success' | 'info'
  });

  const availableAmenities = ['Wifi', 'Aircon', 'Bath', 'Kitchen', 'Gym', 'Laundry', 'Parking', 'Security', 'Water', 'Electricity'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch Profile
        const { data: profile } = await supabase
          .from('User')
          .select('*')
          .eq('id', user.id)
          .single();

        setUserData({
          name: profile?.name || user.user_metadata?.full_name || 'User',
          avatar: profile?.image || user.user_metadata?.avatar_url,
          city: profile?.address_city || 'City',
        });

        // 2. Fetch Dorms
        const { data: dormData } = await supabase
          .from('DormWithRatings')
          .select('*')
          .eq('availability', 'available')
          .order('created_at', { ascending: false });

        setDorms(dormData || []);

        // 3. Fetch Saved Dorms
        const { data: savedData } = await supabase
          .from('SavedDorm')
          .select('dorm_id')
          .eq('user_id', user.id);

        if (savedData) setSavedDormIds(savedData.map(item => item.dorm_id));

        // 4. Fetch Upcoming Visits
        const { data: visitData } = await supabase
          .from('VisitSchedule')
          .select('*, Dorm(name, images)')
          .eq('sender_id', user.id)
          .eq('status', 'accepted')
          .gte('date', format(new Date(), 'yyyy-MM-dd'))
          .order('date', { ascending: true })
          .order('time', { ascending: true })
          .limit(3);

        setUpcomingVisits(visitData || []);

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isCurrentlySaved = savedDormIds.includes(dormId);
      if (isCurrentlySaved) {
        await supabase.from('SavedDorm').delete().eq('user_id', user.id).eq('dorm_id', dormId);
        setSavedDormIds(prev => prev.filter(id => id !== dormId));
        setSuccessModalConfig({ isOpen: true, title: 'Item Removed', message: 'Removed from your favorites', variant: 'info' });
      } else {
        await supabase.from('SavedDorm').insert([{ user_id: user.id, dorm_id: dormId }]);
        setSavedDormIds(prev => [...prev, dormId]);
        setSuccessModalConfig({ isOpen: true, title: 'Dorm Saved!', message: 'Saved to your favorites', variant: 'success' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const SkeletonStats = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8 shimmer">
      <div className="h-40 bg-neutral-dark/10" />
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        <div className="p-8 space-y-3">
          <div className="h-2 w-16 bg-gray-200 rounded" />
          <div className="h-10 w-24 bg-gray-200 rounded" />
        </div>
        <div className="p-8 space-y-3">
          <div className="h-2 w-16 bg-gray-200 rounded" />
          <div className="h-10 w-24 bg-gray-200 rounded" />
        </div>
      </div>
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

      <main className="relative z-10 max-w-2xl mx-auto flex-1 w-full animate-in fade-in slide-in-from-bottom-5 duration-1000 mb-24 pt-8 px-4">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2 bg-white/50 backdrop-blur-sm w-fit px-3 py-1 rounded-full border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(currentTime, 'EEEE')}</span>
              <span className="text-[10px] font-bold text-gray-200">/</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{format(currentTime, 'h:mm a')}</span>
            </div>
            <h1 className="text-3xl font-black text-neutral-dark tracking-tight leading-tight">
              Hey, {userData?.name?.split(' ')[0] || 'Explorer'}!
            </h1>
          </div>

          <Link 
             href="/user/profile"
             className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 hover:scale-105 transition-all text-neutral-dark relative group overflow-hidden"
           >
              {userData?.avatar ? (
                <Image src={userData.avatar} alt="Profile" fill className="object-cover" />
              ) : (
                <User className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
              )}
           </Link>
        </div>

        {/* MAIN STATS CARD */}
        {loading && !userData ? (
          <SkeletonStats />
        ) : (
          <div className="bg-white rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden mb-10 group transition-all duration-700 hover:shadow-[0_50px_120px_-30px_rgba(0,0,0,0.15)] hover:-translate-y-1">

            <div className="grid grid-cols-2 divide-x divide-gray-50 bg-white">
              <Link href="/user/saved" className="p-8 hover:bg-gray-50 transition-colors group/stat">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1 group-hover/stat:text-primary transition-colors">
                  Saved Dorms
                </span>
                <div className="flex items-center gap-3 text-neutral-dark">
                  <div className="p-2 bg-rose-50 rounded-2xl">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  </div>
                  <span className="text-4xl font-bold tracking-tight">{savedDormIds.length}</span>
                </div>
              </Link>
              
              <Link href="/user/calendar" className="p-8 hover:bg-gray-50 transition-colors group/stat">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1 group-hover/stat:text-secondary transition-colors">
                  Upcoming Visits
                </span>
                <div className="flex items-center gap-3 text-neutral-dark">
                  <div className={`p-2 rounded-2xl ${upcomingVisits.length > 0 ? 'bg-secondary/10 text-secondary' : 'bg-gray-50 text-gray-400'}`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-4xl font-bold tracking-tight">{upcomingVisits.length}</span>
                </div>
              </Link>
            </div>
          </div>
        )}



        {/* UPCOMING VISITS SECTION (If any) */}
        {upcomingVisits.length > 0 && (
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-5 px-1">
                <h2 className="text-lg font-bold text-neutral-dark tracking-tight uppercase tracking-widest text-sm truncate">My Tour Schedule</h2>
                <Link href="/user/calendar" className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-1 hover:gap-2 transition-all">
                  Calendar <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
            <div className="space-y-3">
              {upcomingVisits.map((visit) => (
                <Link key={visit.id} href={`/user/calendar?date=${visit.date}`} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all hover:shadow-md">
                   <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden shadow-sm">
                        {visit.Dorm?.images?.[0] ? <Image src={visit.Dorm.images[0]} alt="" fill className="object-cover" /> : <Home className="w-6 h-6 text-gray-200" />}
                      </div>
                      <div>
                         <h3 className="text-sm font-bold text-neutral-dark mb-1">{visit.Dorm?.name}</h3>
                         <div className="flex items-center gap-2 text-[10px] font-semibold text-secondary uppercase tracking-widest">
                            <Clock className="w-3 h-3" /> {isToday(parseISO(visit.date)) ? 'Today' : format(parseISO(visit.date), 'MMM d')} • {visit.time}
                         </div>
                      </div>
                   </div>
                   <div className="bg-gray-50 group-hover:bg-primary group-hover:text-white p-3 rounded-2xl text-gray-400 transition-all">
                      <ChevronRight className="w-5 h-5" />
                   </div>
                </Link>
              ))}
            </div>
          </div>
        )}

                {/* SEARCH & DISCOVERY INTERFACE */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <h2 className="text-lg font-black text-neutral-dark tracking-tight uppercase tracking-widest text-sm mb-5 px-1 truncate">Find your next home</h2>
           <div className="bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.06)] border border-gray-50 p-5 relative">
              <div className="space-y-3">
                 <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl border border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all shadow-inner">
                    <Search className="w-4 h-4 text-primary" />
                    <div className="flex-1">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Where to?</span>
                       <input 
                         type="text" 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         placeholder="City or Dorm name..." 
                         className="bg-transparent font-bold tracking-tight text-neutral-dark outline-none placeholder:text-gray-300 text-base w-full"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setShowFiltersDropdown(!showFiltersDropdown)} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${maxPrice ? 'bg-primary/5 border-primary/20' : 'bg-gray-50/50 border-transparent hover:border-gray-100'}`}>
                       <DollarSign className={`w-4 h-4 ${maxPrice ? 'text-primary' : 'text-gray-400'}`} />
                       <div>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Budget</span>
                       <span className="text-xs font-bold text-neutral-dark uppercase tracking-tight truncate block">{maxPrice ? `₱${Number(maxPrice).toLocaleString()}` : 'Any Price'}</span>
                       </div>
                    </button>
                    <button onClick={() => setShowFiltersDropdown(!showFiltersDropdown)} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${amenitiesFilter.length > 0 ? 'bg-secondary/5 border-secondary/20' : 'bg-gray-50/50 border-transparent hover:border-gray-100'}`}>
                       <SlidersHorizontal className={`w-4 h-4 ${amenitiesFilter.length > 0 ? 'text-secondary' : 'text-gray-400'}`} />
                       <div>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Filters</span>
                       <span className="text-xs font-bold text-neutral-dark uppercase tracking-tight truncate block">{(amenitiesFilter.length + (genderFilter ? 1 : 0)) > 0 ? `${amenitiesFilter.length + (genderFilter ? 1 : 0)} Active` : 'Preferences'}</span>
                       </div>
                    </button>
                 </div>
              </div>

              <AnimatePresence>
                {showFiltersDropdown && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="pt-6 mt-6 border-t border-gray-50 space-y-6">
                       <div>
                          <div className="flex justify-between items-center mb-4">
                             <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Monthly Budget</label>
                             {maxPrice && <button onClick={() => setMaxPrice('')} className="text-[10px] font-bold uppercase text-primary">Reset</button>}
                          </div>
                          <input type="range" min="0" max="20000" step="500" value={maxPrice === '' ? 20000 : maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-primary" />
                          <div className="flex justify-between mt-3"><span className="text-[11px] font-bold text-gray-300">₱0</span><span className="text-xs font-bold text-primary">₱{maxPrice === '' ? '20,000+' : Number(maxPrice).toLocaleString()}</span><span className="text-[11px] font-bold text-gray-300">₱20k+</span></div>
                       </div>
                       <div>
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 block mb-4">Gender Policy</label>
                          <div className="flex gap-2">
                            {['', 'male', 'female', 'mixed'].map(id => (
                              <button key={id} onClick={() => setGenderFilter(id)} className={`flex-1 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${genderFilter === id ? 'bg-primary text-white border-primary shadow-lg' : 'bg-gray-50/50 border-transparent text-gray-400'}`}>
                                {id || 'Any'}
                              </button>
                            ))}
                          </div>
                       </div>
                       <div>
                          <div className="flex justify-between items-center mb-4">
                             <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Amenities</label>
                             {amenitiesFilter.length > 0 && <button onClick={() => setAmenitiesFilter([])} className="text-[10px] font-bold uppercase text-primary">Clear</button>}
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {availableAmenities.map(item => {
                               const isSelected = amenitiesFilter.includes(item);
                               return (
                                 <button 
                                   key={item} 
                                   onClick={() => toggleAmenity(item)} 
                                   className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${isSelected ? 'bg-secondary text-white border-secondary shadow-lg' : 'bg-gray-50/50 border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                 >
                                   {item}
                                 </button>
                               );
                             })}
                          </div>
                       </div>
                       <button onClick={() => setShowFiltersDropdown(false)} className="w-full py-4 bg-neutral-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.25em] shadow-xl hover:bg-black transition-all">Show Results</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* RECOMMENDED SECTION */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-lg font-bold text-neutral-dark tracking-tight uppercase tracking-widest text-sm flex items-center gap-2">
                Discovery Feed 
              </h2>
              <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{filteredDorms.length} Matches</span>
           </div>
           
           {loading ? (
             <div className="grid grid-cols-1 gap-8">
               {[1, 2, 3].map(i => <DormCardSkeleton key={i} />)}
             </div>
           ) : filteredDorms.length === 0 ? (
              <div className="py-20 text-center bg-white/40 rounded-2xl border-2 border-dashed border-gray-200">
                 <Navigation className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">No listings match your search</p>
                 <button onClick={() => { setSearchTerm(''); setMaxPrice(''); setGenderFilter(''); setAmenitiesFilter([]); }} className="px-6 py-3 bg-white border border-gray-200 text-[9px] font-bold uppercase tracking-widest rounded-2xl transition-all">Clear Search</button>
              </div>
           ) : (
              <div className="grid grid-cols-1 gap-8">
                {filteredDorms.map(dorm => (
                  <DormCard key={dorm.id} dorm={dorm} isSaved={savedDormIds.includes(dorm.id)} onToggleSave={handleToggleSave} />
                ))}
              </div>
           )}
        </div>
      </main>
    </>
  );
}
