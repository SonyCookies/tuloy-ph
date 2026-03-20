'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Star, 
  Clock, 
  Home, 
  Heart,
  CheckCircle2,
  Calendar,
  MessageCircle,
  Users,
  ShieldCheck,
  Navigation,
  Info
} from "lucide-react";
import Image from "next/image";
import LoadingModal from "@/app/components/ui/LoadingModal";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import PropertySkeleton from "@/app/components/ui/PropertySkeleton";
import { formatDistanceToNow } from 'date-fns';
import NavigationBar from "@/app/components/NavigationBar";
import AuthBanner from "@/app/components/AuthBanner";

const MapPicker = dynamic(() => import('@/app/components/ui/MapPicker'), { 
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-300">Loading Map...</div>
});

export default function PublicDormDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dorm, setDorm] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [inheritedRules, setInheritedRules] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchDormData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Dorm
        const { data: dormData, error: dormError } = await supabase
          .from('Dorm')
          .select('*')
          .eq('id', id)
          .single();

        if (dormError) throw dormError;
        setDorm(dormData);

        // 2. Fetch Owner
        if (dormData.owner_id) {
          const { data: ownerData } = await supabase
            .from('User')
            .select('*')
            .eq('id', dormData.owner_id)
            .single();
          setOwner(ownerData);
        }

        // 3. Fetch Rules
        if (dormData.rule_ids?.length > 0) {
          const { data: rulesData } = await supabase
            .from('HouseRule')
            .select('*')
            .in('id', dormData.rule_ids);
          setInheritedRules(rulesData || []);
        }

        // 4. Check if Saved (if logged in)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: savedData } = await supabase
            .from('SavedDorm')
            .select('id')
            .eq('user_id', user.id)
            .eq('dorm_id', id)
            .single();
          setIsSaved(!!savedData);
        }

        // 5. Fetch Ratings
        const { data: ratingsData } = await supabase
          .from('Ratings')
          .select('*, reviewer:User(name, image)')
          .eq('dorm_id', id)
          .order('created_at', { ascending: false });
        
        if (ratingsData) {
          setRatings(ratingsData);
          const avg = ratingsData.length > 0 
            ? ratingsData.reduce((acc, curr) => acc + curr.rating, 0) / ratingsData.length 
            : 0;
          setAverageRating(avg);
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDormData();
  }, [id]);

  const handleToggleSave = () => {
    // Public view always redirects to login for "Save"
    router.push('/auth/login');
  };

  const nextImage = () => {
    if (!dorm?.images || dorm.images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % dorm.images.length);
  };

  const prevImage = () => {
    if (!dorm?.images || dorm.images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + dorm.images.length) % dorm.images.length);
  };

  if (loading) return <PropertySkeleton isStudent={true} />;
  if (!dorm) return null;

  const images = dorm.images || [];

  const getListingTypeIcon = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('upper')) return <ChevronRight className="w-3.5 h-3.5 text-amber-500 -rotate-90" />;
    if (t.includes('lower')) return <ChevronRight className="w-3.5 h-3.5 text-amber-500 rotate-90" />;
    return <Home className="w-3.5 h-3.5 text-amber-500" />;
  };

  return (
    <div className="min-h-screen bg-white relative pb-32">
      <NavigationBar />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-neutral-dark mb-1 tracking-tight">Public View</h1>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.15em] opacity-60">Property Information</p>
          </div>
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-dark" />
          </button>
        </div>

        <main className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
          
          {/* Hero Image Card */}
          <div className="relative h-[300px] rounded-2xl overflow-hidden border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.08)] bg-white group">
            <AnimatePresence mode="wait">
              <motion.div key={currentImageIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
                {images.length > 0 ? (
                  <Image src={images[currentImageIndex]} alt="" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center"><Home className="w-12 h-12 text-gray-200" /></div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${
                dorm.availability === 'available' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
              }`}>
                {dorm.availability}
              </span>
            </div>

            {/* Save Toggle Button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={handleToggleSave}
                className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
              >
                <Heart className="w-5 h-5 text-gray-300 group-hover:text-red-400" />
              </button>
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button onClick={prevImage} className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-dark shadow-sm"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={nextImage} className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-dark shadow-sm"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>

          {/* Simplified Rate & Info Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="flex items-center">
              <div className="flex-1 p-6 border-r border-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Monthly Rent</span>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-1 ml-auto">
                      <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-black text-neutral-dark">{averageRating.toFixed(1)}</span>
                      <span className="text-[10px] font-black text-gray-300 uppercase italic">({ratings.length})</span>
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-neutral-dark tracking-tighter">₱{Number(dorm.price).toLocaleString()}</span>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">/mo</span>
                </div>
              </div>
              <div className="px-8 py-6 flex flex-col items-center justify-center bg-gray-50/30">
                <Calendar className="w-4 h-4 text-primary mb-1.5" />
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Listed On</span>
                <span className="text-[11px] font-black text-neutral-dark uppercase">
                  {new Date(dorm.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Core Info */}
          <div className="bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="text-2xl font-black text-neutral-dark tracking-tighter leading-tight">
                {dorm.name}
              </h2>
            </div>

            <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/20">
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">Location</span>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-neutral-dark/70 leading-relaxed tracking-wide">
                  {dorm.exact_address || dorm.location}
                </p>
              </div>
            </div>

            <div className="flex divide-x divide-gray-50 border-t border-gray-50">
              <div className="flex-1 px-6 py-5">
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">Gender Policy</span>
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 text-secondary" />
                  <p className="text-[11px] font-black text-neutral-dark uppercase tracking-wider">
                    {dorm.gender_policy === 'mixed' ? 'Co-ed' : dorm.gender_policy}
                  </p>
                </div>
              </div>

              <div className="flex-1 px-6 py-5">
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">Listing Type</span>
                <div className="flex items-center gap-2">
                  {getListingTypeIcon(dorm.listing_type)}
                  <p className="text-[11px] font-black text-neutral-dark uppercase tracking-wider">
                    {dorm.listing_type}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">About this property</span>
            </div>
            <p className="text-[13px] font-medium text-neutral-dark/80 leading-relaxed">
              {dorm.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 ml-1">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Included Amenities</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(dorm.amenities || []).map((amenity: string) => (
                <div key={amenity} className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-neutral-dark">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map Location */}
          <div className="bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
               <div className="p-2.5 bg-white rounded-xl text-secondary shadow-sm"><Navigation className="w-4 h-4" /></div>
               <span className="text-[10px] font-black text-neutral-dark uppercase tracking-widest">Location</span>
            </div>
            <div className="p-4">
              <MapPicker 
                lat={dorm.latitude} 
                lng={dorm.longitude} 
                readOnly={true}
              />
            </div>
          </div>

          {/* Login CTA Card */}
          <div className="bg-neutral-dark rounded-2xl p-8 border border-neutral-dark shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-1000" />
            <div className="relative z-10 text-center">
               <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/10">
                  <ShieldCheck className="w-8 h-8 text-white" />
               </div>
               <h3 className="text-2xl font-black text-white tracking-tight mb-2">Want to inquire?</h3>
               <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">Sign in to message the owner and book a tour</p>
               <button 
                 onClick={() => router.push('/auth/login')}
                 className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] transition-all shadow-xl shadow-primary/20 active:scale-[0.98]"
               >
                 Sign in to proceed
               </button>
            </div>
          </div>

        </main>
      </div>

      <AuthBanner />
    </div>
  );
}
