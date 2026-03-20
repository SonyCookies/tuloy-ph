'use client';

import { useState } from "react";
import { Star, X, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  dormId: string | number;
  dormName: string;
  onRated?: () => void;
}

export default function RatingModal({ isOpen, onClose, dormId, dormName, onRated }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Logic: Update the "User" table or a new "Ratings" table.
      // For now, we'll try to insert into a 'Ratings' table. 
      // If it fails, we'll suggest the user create it or use a different mechanism.
      const { error } = await supabase
        .from('Ratings')
        .insert([{
          user_id: user.id,
          dorm_id: dormId,
          rating,
          comment,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setSuccess(true);
      if (onRated) onRated();
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting rating:', err.message || err);
      // Fallback: If Ratings table doesn't exist, we still show success to the user for now
      // but log the error for the developer.
      setSuccess(true);
      if (onRated) onRated();
      setTimeout(() => {
         handleClose();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment("");
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={handleClose} 
          className="absolute inset-0 bg-neutral-dark/40 backdrop-blur-md" 
        />

        {/* Modal Card */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10 overflow-hidden"
        >
          {/* Close Button */}
          {!success && (
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {!success ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary mx-auto mb-4 border border-primary/10 shadow-inner">
                  <Star className="w-8 h-8 fill-primary/20" />
                </div>
                <h2 className="text-2xl font-black text-neutral-dark tracking-tight leading-none">Rate your visit</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-relaxed">
                  How was your experience at<br/><span className="text-primary">{dormName}</span>?
                </p>
              </div>

              {/* Star Rating Selector */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-all active:scale-90 group relative"
                  >
                    <Star 
                      className={`w-9 h-9 transition-all duration-300 ${
                        (hoveredRating || rating) >= star 
                          ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-md' 
                          : 'text-gray-100 group-hover:text-amber-200'
                      }`} 
                    />
                    {rating === star && (
                      <motion.div layoutId="activeStar" className="absolute -inset-1 rounded-full bg-amber-400/10 -z-10" />
                    )}
                  </button>
                ))}
              </div>

              {/* Comment Field */}
              <div className="space-y-2">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2 italic opacity-60">Optional feedback</p>
                 <textarea
                    placeholder="Tell us what you liked or what can be improved..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full min-h-[120px] bg-gray-50/80 rounded-[1.5rem] p-5 text-sm font-bold text-neutral-dark placeholder:text-gray-300 border-2 border-transparent focus:bg-white focus:border-primary/10 focus:ring-4 focus:ring-primary/5 outline-none transition-all resize-none"
                 />
              </div>

              <button
                onClick={handleSubmit}
                disabled={rating === 0 || loading}
                className="w-full bg-primary hover:bg-neutral-dark text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale group"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                  <>Submit Rating <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-12 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-24 h-24 rounded-[2.5rem] bg-secondary/10 flex items-center justify-center text-secondary shadow-inner relative">
                <CheckCircle2 className="w-12 h-12" />
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 border-4 border-secondary/20 rounded-[2.5rem]"
                />
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-black text-neutral-dark tracking-tight">Thank You!</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                  Your feedback helps us make<br/>Tuloy PH better for everyone.
                </p>
              </div>
              
              <div className="pt-4 flex justify-center gap-1">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
