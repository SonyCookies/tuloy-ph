'use client';

import { Search, DollarSign, Wifi, MapPin, Star, Heart, SlidersHorizontal, Navigation, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import LoadingSpinner from "./ui/LoadingSpinner";
import NavigationBar from "./NavigationBar";
import AuthBanner from "./AuthBanner";

function DormCard({ dorm }: { dorm: any }) {
  const image = dorm.images?.[0];
  const location = `${dorm.address_city}, ${dorm.address_province}`;

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-500 group cursor-pointer relative mx-auto w-full">
      <div className="relative h-52 sm:h-60 w-full overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={dorm.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <MapPin className="w-10 h-10 text-gray-200" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 scale-90 sm:scale-100 origin-top-left">
          <span className="bg-white/90 backdrop-blur-md text-neutral-dark text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-sm border border-white">
            {dorm.listing_type}
          </span>
        </div>

        <button className="absolute top-4 right-4 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm scale-90 sm:scale-100">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
           <div className="bg-primary text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-1.5 border border-white/20">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">₱</span>
              <span className="text-xs sm:text-sm font-black tracking-tight">{Number(dorm.price).toLocaleString()}</span>
              <span className="text-[7px] sm:text-[8px] font-black opacity-60 uppercase tracking-widest">/mo</span>
           </div>
           
           {/* Rating Badge */}
           {dorm.review_count > 0 && (
             <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-white flex items-center gap-1.5 group-hover:scale-105 transition-transform">
               <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
               <span className="text-[11px] font-black text-neutral-dark tracking-tighter">
                 {dorm.avg_rating?.toFixed(1)}
               </span>
               <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                 ({dorm.review_count})
               </span>
             </div>
           )}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex text-amber-500">
             {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                    i < Math.floor(dorm.avg_rating || 0) 
                      ? 'fill-amber-500 text-amber-500' 
                      : (dorm.avg_rating || 0) > i 
                        ? 'text-amber-500 fill-amber-500 opacity-50' 
                        : 'text-gray-200'
                  }`} 
                />
             ))}
          </div>
          {dorm.review_count > 0 ? (
            <span className="text-[8px] sm:text-[9px] font-black text-gray-300 uppercase tracking-widest">
              {dorm.review_count} Verified Review{dorm.review_count !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-[8px] sm:text-[9px] font-black text-gray-200 uppercase tracking-widest line-through decoration-amber-500/20">New Property</span>
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-black text-neutral-dark mb-1 group-hover:text-primary transition-colors leading-tight">
          {dorm.name}
        </h3>

        <div className="flex items-center gap-1.5 text-gray-400 font-bold mb-4 sm:mb-5">
          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-secondary" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider truncate">{location}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {(dorm.amenities || []).slice(0, 3).map((amenity: string) => (
            <span key={amenity} className="text-[7px] sm:text-[8px] font-black text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg uppercase tracking-[0.15em]">
              {amenity}
            </span>
          ))}
          {(dorm.amenities || []).length > 3 && (
            <span className="text-[7px] sm:text-[8px] font-black text-gray-300 bg-transparent px-2 py-1.5 rounded-lg uppercase tracking-widest">
              +{(dorm.amenities || []).length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrowseDorms() {
  const [dorms, setDorms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDorms = async () => {
      try {
        const { data, error } = await supabase
          .from('DormWithRatings')
          .select('*')
          .eq('availability', 'available')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDorms(data || []);
      } catch (err) {
        console.error('Error fetching dorms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDorms();
  }, []);
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <NavigationBar />
      {/* Hero Section */}
      <main className="flex-1 px-5 pt-6 pb-32 max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Search Context */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
           <div className="p-2 sm:p-2.5 bg-secondary/10 rounded-xl text-secondary">
              <Navigation className="w-4 h-4 sm:w-5 sm:h-5 fill-secondary" />
           </div>
           <div className="flex -space-x-2.5 sm:-space-x-3">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-[3px] border-white overflow-hidden bg-gray-100 relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                </div>
              ))}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-[3px] border-white bg-gray-50 flex items-center justify-center text-[8px] sm:text-[10px] font-extrabold text-gray-400">
                +1k
              </div>
           </div>
        </div>

        <div className="mb-8 sm:mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-dark mb-2 sm:mb-3 tracking-tight leading-[1.1] px-2">
            Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Dream Space</span>
          </h1>
          <p className="text-gray-400 font-bold text-[9px] sm:text-[11px] uppercase tracking-[0.25em]">
            Curated student housing
          </p>
        </div>

        {/* Modern Search Interface - Optimized for Mobile */}
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 p-5 sm:p-8 mb-12 sm:mb-16 relative group">
           <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 bg-neutral-dark text-white px-5 sm:px-6 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] shadow-xl whitespace-nowrap">
              Smart Filter
           </div>
           
           <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 sm:gap-5 p-3.5 sm:p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                <div className="p-2.5 sm:p-3 bg-white rounded-xl shadow-sm text-primary flex-shrink-0">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[8px] sm:text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Where to live?</span>
                  <input 
                    type="text" 
                    placeholder="Search city or university..." 
                    className="bg-transparent font-black tracking-tight text-neutral-dark outline-none placeholder:text-gray-300 text-sm sm:text-base w-full overflow-hidden text-ellipsis"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-5 p-3.5 sm:p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                  <div className="p-2.5 sm:p-3 bg-white rounded-xl shadow-sm text-secondary flex-shrink-0">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] sm:text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Budget</span>
                    <span className="font-black tracking-tight text-neutral-dark text-[11px] sm:text-sm truncate">Any price</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-5 p-3.5 sm:p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                  <div className="p-2.5 sm:p-3 bg-white rounded-xl shadow-sm text-amber-500 flex-shrink-0">
                    <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] sm:text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Type</span>
                    <span className="font-black tracking-tight text-neutral-dark text-[11px] sm:text-sm truncate">Filters</span>
                  </div>
                </div>
              </div>
           </div>

           <button className="w-full bg-neutral-dark hover:bg-black text-white py-4 sm:py-5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] shadow-2xl flex items-center justify-center gap-2 sm:gap-3 active:scale-[0.98] transition-all">
              Search Now
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
           </button>
        </div>

        {/* Results Section */}
        <div className="px-1 sm:px-0">
          <div className="flex justify-between items-end mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-dark leading-none tracking-tight">Best Spaces</h2>
              <div className="h-1 w-10 sm:w-12 bg-secondary mt-2.5 sm:mt-3 rounded-full" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-gray-300 uppercase tracking-widest">{dorms.length} Available</span>
          </div>
          
          {loading ? (
            <div className="py-20 flex flex-center flex-col items-center">
               <LoadingSpinner />
            </div>
          ) : dorms.length === 0 ? (
            <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
               <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-4" />
               <p className="font-black text-gray-300 uppercase tracking-widest text-xs">No listings available right now</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10">
              {dorms.map(dorm => (
                <DormCard key={dorm.id} dorm={dorm} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer / Empty Space for Mobile */}
      <div className="h-20" />

      {/* Floating Auth Banner */}
      <AuthBanner />
    </div>
  );
}
