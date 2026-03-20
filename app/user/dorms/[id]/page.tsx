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
import MessageOwnerModal from "../../../components/ui/MessageOwnerModal";
import dynamic from 'next/dynamic';
import PropertySkeleton from "@/app/components/ui/PropertySkeleton";
import { formatDistanceToNow } from 'date-fns';

const MapPicker = dynamic(() => import('@/app/components/ui/MapPicker'), { 
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-300">Loading Map...</div>
});

export default function DormDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dorm, setDorm] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [inheritedRules, setInheritedRules] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

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

        // 4. Check if Saved
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

  const handleToggleSave = async () => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      if (isSaved) {
        // Unsave
        await supabase
          .from('SavedDorm')
          .delete()
          .eq('user_id', user.id)
          .eq('dorm_id', id);
        setIsSaved(false);
      } else {
        // Save
        await supabase
          .from('SavedDorm')
          .insert({
            user_id: user.id,
            dorm_id: id
          });
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    } finally {
      setIsSaving(false);
    }
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
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply">
        <Image src="/backgrounds/tuloyphonboardingbg.svg" alt="" fill className="object-cover" priority />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-30 py-6 mb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-neutral-dark mb-1 tracking-tight">Details</h1>
              <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.15em] opacity-60">Property Information</p>
            </div>
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-dark" />
            </button>
          </div>
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
                disabled={isSaving}
                className={`w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center transition-all active:scale-95 group ${
                   isSaving ? 'opacity-50 grayscale' : 'hover:scale-105'
                }`}
              >
                <Heart 
                  className={`w-5 h-5 transition-all duration-300 ${
                    isSaved 
                      ? 'fill-red-500 text-red-500 scale-110' 
                      : 'text-gray-300 group-hover:text-red-400'
                  }`} 
                />
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

          {/* Core Info - Refined Typographic Layout (Synced with Owner View) */}
          <div className="bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
            
            {/* Primary Identity Section */}
            <div className="px-6 py-4 border-b border-gray-50">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-neutral-dark tracking-tighter leading-tight">
                  {dorm.name}
                </h2>
              </div>
            </div>

            {/* Location Section */}
            <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/20">
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">Location</span>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-neutral-dark/70 leading-relaxed tracking-wide">
                  {dorm.location}
                </p>
              </div>
            </div>

            {/* Specification Grid */}
            <div className="flex divide-x divide-gray-50 border-t border-gray-50">
              {/* Gender Policy */}
              <div className="flex-1 px-6 py-5">
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">Gender Policy</span>
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 text-secondary" />
                  <p className="text-[11px] font-black text-neutral-dark uppercase tracking-wider">
                    {dorm.gender_policy === 'mixed' ? 'Co-ed' : dorm.gender_policy}
                  </p>
                </div>
              </div>

              {/* Listing Type */}
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

          {/* Redesigned Description Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">About this property</span>
            </div>
            <p className="text-[13px] font-medium text-neutral-dark/80 leading-relaxed">
              {dorm.description}
            </p>
          </div>

          {/* Amenities Grid */}
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

          {/* Rules Section */}
          <div className="bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
             <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                <span className="text-[10px] font-black text-neutral-dark uppercase tracking-widest">House Rules & Terms</span>
             </div>
             <div className="p-5 space-y-4">
                {dorm.curfew && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-dark">Curfew: {dorm.curfew}</p>
                  </div>
                )}
                <div className="space-y-3">
                  {inheritedRules.map((rule) => (
                    <div key={rule.id} className="flex items-start gap-3">
                      <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-dark">{rule.rule_text}</p>
                    </div>
                  ))}
                  {(dorm.rules || []).map((rule: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-dark">{rule}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>

           {/* Reviews Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="text-[10px] font-black text-neutral-dark uppercase tracking-widest">Reviews ({ratings.length})</h3>
              </div>
              {averageRating > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                  <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{averageRating.toFixed(1)} / 5</span>
                </div>
              )}
            </div>
            <div className="p-6">
              {ratings.length > 0 ? (
                <div className="space-y-6">
                  {ratings.map((review) => (
                    <div key={review.id} className="group">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-50 overflow-hidden relative border border-gray-100 shadow-sm">
                            {review.reviewer?.image ? (
                              <Image src={review.reviewer.image} alt="" fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary font-black text-[9px] uppercase">
                                {review.reviewer?.name?.[0] || 'U'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-neutral-dark tracking-tighter uppercase">{review.reviewer?.name || 'Anonymous'}</p>
                            <div className="flex gap-0.5 mt-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-2.5 h-2.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-100'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-[12px] font-medium text-neutral-dark/70 leading-relaxed pl-11 italic pr-4">
                          "{review.comment}"
                        </p>
                      )}
                      {review.id !== ratings[ratings.length - 1].id && (
                        <div className="h-px bg-gray-50 w-full mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-4 border border-gray-100 shadow-inner">
                    <Star className="w-6 h-6" />
                  </div>
                  <h4 className="text-[11px] font-black text-neutral-dark uppercase tracking-widest mb-1.5 opacity-40">No reviews yet</h4>
                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-relaxed">Verified visits will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Location Section */}
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

          {/* Owner & Inquire Card (New Part Added) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-2 border-primary p-0.5 shadow-sm">
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-50">
                    {owner?.image ? (
                      <Image src={owner.image} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-black uppercase">{owner?.name?.[0]}</div>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">Listed by</span>
                  <h4 className="text-xl font-black text-neutral-dark tracking-tight leading-none mb-1.5">{owner?.name || 'Owner'}</h4>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsMessageModalOpen(true)}
              className="w-full bg-primary hover:opacity-90 active:scale-[0.98] text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <MessageCircle className="w-5 h-5" />
              Inquire Now
            </button>
          </div>

        </main>
      </div>

      <MessageOwnerModal 
        isOpen={isMessageModalOpen} 
        onClose={() => setIsMessageModalOpen(false)} 
        dorm={dorm} 
        owner={owner}
      />
    </div>
  );
}