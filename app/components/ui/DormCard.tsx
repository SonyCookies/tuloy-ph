'use client';

import { Star, MapPin, Heart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function DormCard({ 
  dorm, 
  isSaved = false, 
  onToggleSave 
}: { 
  dorm: any; 
  isSaved?: boolean; 
  onToggleSave?: (e: React.MouseEvent, dormId: string) => void;
}) {
  const router = useRouter();
  const image = dorm.images?.[0];
  const location = dorm.exact_address;

  const handleCardClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push(`/user/dorms/${dorm.id}`);
    } else {
      router.push(`/dorms/${dorm.id}`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-2xl overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] border border-gray-50 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] transition-all duration-500 group cursor-pointer relative mx-auto w-full"
    >
      <div className="relative h-48 sm:h-56 w-full overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={dorm.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-gray-200" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 origin-top-left">
          <span className="bg-white/90 backdrop-blur-md text-neutral-dark text-[7.5px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-2xl shadow-sm border border-white">
            {dorm.listing_type}
          </span>
          <span className="bg-primary/90 backdrop-blur-md text-white text-[7.5px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-2xl shadow-sm border border-white/20">
            {dorm.gender_policy === 'mixed' ? 'Mixed' : dorm.gender_policy}
          </span>
        </div>

        <motion.button 
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.(e, dorm.id);
          }}
          className={`absolute top-3 right-3 w-8 h-8 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-sm z-10 ${
            isSaved ? 'bg-red-500 text-white border-red-400' : 'bg-white/90 text-gray-400 hover:text-red-500 border-white/50'
          } border`}
        >
          <motion.div
            initial={false}
            animate={{ scale: isSaved ? [1, 1.4, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </motion.div>
        </motion.button>

        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
           <div className="bg-primary text-white px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-1 border border-white/20">
              <span className="text-[8px] font-bold uppercase tracking-widest">₱</span>
              <span className="text-xs font-bold tracking-tight">{Number(dorm.price).toLocaleString()}</span>
              <span className="text-[7.5px] font-bold opacity-60 uppercase tracking-widest">/mo</span>
           </div>

           {/* Rating Badge */}
           {dorm.review_count > 0 && (
             <div className="bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-sm border border-white flex items-center gap-1.5 transition-transform group-hover:scale-105">
               <div className="flex">
                 <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
               </div>
               <span className="text-[10px] font-black text-neutral-dark tracking-tighter">
                 {dorm.avg_rating?.toFixed(1)}
               </span>
               <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                 ({dorm.review_count})
               </span>
             </div>
           )}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex text-amber-500">
             {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-2.5 h-2.5 ${
                    i < Math.floor(dorm.avg_rating || 0) 
                      ? 'fill-amber-500 text-amber-500' 
                      : (dorm.avg_rating || 0) > i 
                        ? 'text-amber-500 fill-amber-500 opacity-50' 
                        : 'text-gray-300'
                  }`} 
                />
             ))}
          </div>
          {dorm.review_count > 0 ? (
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">
              {dorm.review_count} Verified Review{dorm.review_count !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">New Property</span>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-neutral-dark mb-1 group-hover:text-primary transition-colors leading-tight tracking-tight">
          {dorm.name}
        </h3>

        <div className="flex items-center gap-1 text-gray-400 font-bold mb-3 sm:mb-4">
          <MapPin className="w-2.5 h-2.5 text-secondary" />
          <span className="text-[12px] font-normal tracking-wider truncate">{location}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(dorm.amenities || []).slice(0, 3).map((amenity: string) => (
            <span key={amenity} className="text-[10px] font-bold text-gray-400 bg-gray-50/50 border border-gray-100 px-2.5 py-1 rounded-2xl uppercase tracking-[0.1em]">
              {amenity}
            </span>
          ))}
          {(dorm.amenities || []).length > 3 && (
            <span className="text-[10px] font-black text-gray-300 px-2 py-1 rounded-lg uppercase tracking-widest">
              +{(dorm.amenities || []).length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
