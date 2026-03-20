'use client';

import { Search, Shield, BadgeCheck, Users, MapPin, ArrowRight, Star, Heart, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// --- Landing Page Sub-components ---

const Hero = ({ onStart, onLearnMore, onInstall, isInstalled }: { 
  onStart: () => void, 
  onLearnMore: () => void,
  onInstall: () => void,
  isInstalled: boolean
}) => (
  <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 overflow-hidden bg-white">
    {/* ... animated background ... */}
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
          y: [0, -50, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[100px]" 
      />
      <motion.div 
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[100px]" 
      />
    </div>

    <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto py-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, type: "spring" }}
        className="mb-8"
      >
        <Image 
          src="/logo/tuloyphownerbg.png" 
          alt="Tuloy PH Logo" 
          width={120} 
          height={120} 
          className="rounded-3xl shadow-2xl"
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, type: "spring", delay: 0.1 }}
        className="mb-10"
      >
        <span className="bg-primary/5 text-primary text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-full border border-primary/10 inline-block shadow-sm">
          Trusted by 10k+ Students
        </span>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-5xl sm:text-6xl md:text-8xl font-black text-neutral-dark mb-8 tracking-tighter leading-[0.9] sm:leading-[0.85]"
      >
        Your Next <br className="hidden sm:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">Dream Home</span> <br className="hidden sm:block" />
        Starts Here.
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-gray-500 text-base sm:text-lg md:text-xl font-medium mb-12 max-w-md sm:max-w-lg mx-auto leading-relaxed px-4"
      >
        Discover premium dormitories and student housing with verified owners, safe environments, and community-first living.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-6 sm:px-0"
      >
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full sm:w-auto bg-neutral-dark text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 transition-colors hover:bg-black"
        >
          Start Exploring
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
        
        {!isInstalled && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onInstall}
            className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 hover:bg-primary-dark transition-colors"
          >
            Install App
            <CheckCircle2 className="w-5 h-5" />
          </motion.button>
        )}

        <button 
          onClick={onLearnMore}
          className="w-full sm:w-auto bg-white text-neutral-dark px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] border-2 border-gray-100 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
        >
          Learn More
        </button>
      </motion.div>
    </div>

    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden sm:block"
    >
      <div className="flex flex-col items-center gap-3">
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </motion.div>
  </section>
);

const InstallTip = ({ isIOS, onClose }: { isIOS: boolean, onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-end justify-center p-6 sm:items-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100 relative overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
      
      <div className="relative z-10">
        <h4 className="text-xl font-black text-neutral-dark mb-4 tracking-tight">How to Install</h4>
        {isIOS ? (
          <ol className="space-y-4 text-gray-500 text-sm font-medium">
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black">1</div>
              <span>Tap the <span className="text-blue-500 font-bold">Share</span> button below</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black">2</div>
              <span>Scroll down and tap <span className="font-bold text-neutral-dark">"Add to Home Screen"</span></span>
            </li>
          </ol>
        ) : (
          <p className="text-gray-500 text-sm font-medium leading-relaxed">
            Open your browser menu (usually the three dots <span className="font-bold">⋮</span> or <span className="font-bold">···</span>) and select <span className="text-neutral-dark font-bold">"Install app"</span> or <span className="text-neutral-dark font-bold">"Add to Home Screen"</span>.
          </p>
        )}
        <button 
          onClick={onClose}
          className="mt-8 w-full py-4 bg-neutral-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest"
        >
          Got it
        </button>
      </div>
    </motion.div>
  </div>
);

const Features = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Safe & Verified",
      color: "from-blue-500 to-primary",
      description: "Every listing and owner is thoroughly vetted for your peace of mind."
    },
    {
      icon: <BadgeCheck className="w-8 h-8" />,
      title: "Best Rates",
      color: "from-secondary to-green-500",
      description: "Exclusive student discounts and affordable transient stays."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community First",
      color: "from-amber-400 to-orange-500",
      description: "Join thousands of students finding their ideal home away from home."
    }
  ];

  return (
    <section className="py-24 px-6 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[11px] font-black uppercase tracking-[0.5em] text-secondary mb-4 block"
          >
            Why Tuloy PH?
          </motion.span>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-dark tracking-tight leading-tight">
            Built for Students, <br className="hidden sm:block" />
            by People who care.
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-100 flex flex-col items-center text-center group cursor-default transition-all duration-500"
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-[2rem] flex items-center justify-center mb-8 text-white shadow-xl shadow-current/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                {feature.icon}
              </div>
              <h4 className="text-2xl font-black text-neutral-dark mb-4">{feature.title}</h4>
              <p className="text-gray-400 text-base font-medium leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { number: "01", title: "Smart Search", description: "Filter by location, budget, and specific student amenities like high-speed WiFi." },
    { number: "02", title: "Easy Visit", description: "Schedule a secure viewing or virtual tour directly with verified property owners." },
    { number: "03", title: "Secure Booking", description: "Secure your dream spot with our easy, transparent booking process." }
  ];

  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative p-2"
            >
              <div className="absolute inset-0 bg-primary/5 rounded-[4rem] -rotate-3 transition-transform hover:rotate-0 duration-700" />
              <div className="relative aspect-[4/5] sm:aspect-square bg-white rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-0" />
                <Image src="/get_started_bg.png" alt="Finding Home" fill className="object-cover relative z-10 p-8 sm:p-12 hover:scale-105 transition-transform duration-700" />
                
                <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white z-20 animate-in fade-in zoom-in-95 duration-1000">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Trust Score</p>
                      <p className="text-base font-black text-neutral-dark tracking-tight">100% Verified Listings</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="order-1 lg:order-2">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-[11px] font-black uppercase tracking-[0.5em] text-primary mb-4 block"
            >
              The Experience
            </motion.span>
            <h3 className="text-4xl md:text-6xl font-black text-neutral-dark tracking-tight mb-8 leading-tight">Finding your place should be easy.</h3>
            <p className="text-gray-500 text-lg font-medium mb-12 leading-relaxed max-w-xl">
              We've streamlined every step of your housing journey. From the first search to move-in day, Tuloy PH is with you.
            </p>
            <div className="space-y-10">
              {steps.map((step, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="flex gap-6 items-start group"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-gray-100 tracking-tighter group-hover:text-primary/20 transition-colors uppercase italic">{step.number}</span>
                    {index !== steps.length - 1 && <div className="w-0.5 h-12 bg-gray-50 mt-2" />}
                  </div>
                  <div className="pt-2">
                    <h4 className="text-xl font-black text-neutral-dark mb-2 group-hover:text-primary transition-colors">{step.title}</h4>
                    <p className="text-gray-400 text-base font-medium leading-relaxed max-w-sm">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Stats = () => (
  <section className="py-20 px-6 bg-gray-50/30">
    <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        { label: "Verified Dorms", value: "1,200+" },
        { label: "Major Cities", value: "15+" },
        { label: "Active Students", value: "8,500+" },
        { label: "Success Rate", value: "99.9%" }
      ].map((stat, index) => (
        <motion.div 
          key={index} 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100"
        >
          <p className="text-4xl font-black text-neutral-dark mb-2 tracking-tighter">{stat.value}</p>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

const PopularChoices = ({ onStart, dorms }: { onStart: () => void, dorms: any[] }) => (
  <section className="py-24 px-6 overflow-hidden bg-white">
    <div className="max-w-6xl mx-auto">
      <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[11px] font-black uppercase tracking-[0.5em] text-secondary mb-4 block"
          >
            Curated Spaces
          </motion.span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-dark tracking-tight">Student-favorite picks.</h2>
        </div>
        <motion.button 
          whileHover={{ x: 5 }}
          onClick={onStart} 
          className="text-[11px] font-black uppercase tracking-widest text-secondary flex items-center gap-2 hover:opacity-80 transition-all"
        >
          View All Listings <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
      
      <div className="flex gap-8 overflow-x-auto no-scrollbar px-4 -mx-4 pb-12 snap-x snap-mandatory min-h-[400px]">
         {dorms.length === 0 ? (
           // Skeleton Loaders
           [1, 2, 3].map((i) => (
             <div key={i} className="min-w-[300px] sm:min-w-[350px] h-[450px] bg-gray-50 rounded-[3rem] animate-pulse border border-gray-100" />
           ))
         ) : (
           dorms.map((dorm) => (
             <motion.div 
              key={dorm.id} 
              whileHover={{ y: -5 }}
              onClick={onStart}
              className="min-w-[300px] sm:min-w-[350px] bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden group snap-center cursor-pointer"
             >
                <div className="relative h-60 bg-gray-100 overflow-hidden">
                  {dorm.images?.[0] ? (
                    <Image src={dorm.images[0]} alt={dorm.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-50 flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-gray-200" />
                    </div>
                  )}
                  <div className="absolute top-6 left-6 z-20">
                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[9px] text-black uppercase tracking-widest border border-white shadow-sm">
                      {dorm.price <= 5000 ? '💎 Best Value' : '✨ Featured'}
                    </span>
                  </div>
                  <button className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-primary transition-colors border border-white shadow-sm">
                    <Heart className="w-5 h-5" />
                  </button>
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-3 h-3 ${dorm.review_count > 0 && star <= Math.round(dorm.avg_rating || 0) ? 'fill-current' : 'text-gray-100'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                      {dorm.review_count > 0 ? (
                        `${dorm.avg_rating?.toFixed(1)} · ${dorm.review_count} Reviews`
                      ) : (
                        'No reviews yet'
                      )}
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-neutral-dark mb-2 group-hover:text-primary transition-colors leading-tight truncate">
                    {dorm.name}
                  </h4>
                  <div className="flex items-start gap-1.5 text-gray-400 mb-6 min-h-[40px]">
                    <MapPin className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <span className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                      {dorm.exact_address}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                     <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-neutral-dark">₱{Number(dorm.price).toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">/ month</span>
                     </div>
                     <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-neutral-dark group-hover:bg-neutral-dark group-hover:text-white transition-all">
                        <ArrowRight className="w-5 h-5" />
                     </div>
                  </div>
                </div>
             </motion.div>
           ))
         )}
      </div>
    </div>
  </section>
);

const CTA = ({ onStart }: { onStart: () => void }) => (
  <section className="py-24 px-6">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="max-w-6xl mx-auto bg-neutral-dark rounded-[4rem] p-12 sm:p-24 text-center relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -ml-64 -mb-64" />
      
      <div className="relative z-10 max-w-2xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9]"
        >
          Ready to find <br /> your space?
        </motion.h2>
        <p className="text-gray-400 text-lg sm:text-xl font-medium mb-12 leading-relaxed">
          Join 8,000+ students already using Tuloy PH to find their perfect housing.
        </p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="bg-white text-neutral-dark px-14 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-3"
        >
          Get Started Now
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  </section>
);

const Footer = () => (
  <footer className="py-20 px-6 border-t border-gray-100 bg-white">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
      <div className="flex flex-col items-center md:items-start gap-6">
        <div className="relative w-32 h-16 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-pointer">
          <Image src="/logo/tuloyphlogolandscape.svg" alt="Tuloy PH" fill className="object-contain" />
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-300">© 2026 Tuloy PH. All Rights Reserved.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 items-center">
         <div className="flex gap-8">
           {['Terms', 'Privacy', 'Safety', 'Press'].map(item => (
             <a key={item} href="#" className="text-[11px] font-black uppercase tracking-widest text-gray-300 hover:text-primary transition-all">
               {item}
             </a>
           ))}
         </div>
         <div className="flex gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-primary/5 hover:text-primary transition-all cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-current opacity-30" />
              </div>
            ))}
         </div>
      </div>
    </div>
  </footer>
);


// --- Main Home Component ---

export default function Home() {
  const router = useRouter();
  const [popularDorms, setPopularDorms] = useState<any[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
        setIsInstalled(true);
      }

      // Detect iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));

      // 1. Check if the prompt was already captured by the layout script
      if ((window as any).deferredPWAInstallPrompt) {
        setDeferredPrompt((window as any).deferredPWAInstallPrompt);
      }

      // 2. Listen for the custom event if it's captured later
      const handleStoredPrompt = () => {
        setDeferredPrompt((window as any).deferredPWAInstallPrompt);
      };

      // 3. Keep the normal listener just in case
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener('pwa-prompt-captured', handleStoredPrompt);
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('pwa-prompt-captured', handleStoredPrompt);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowTip(true);
    }
  };

  useEffect(() => {
    const fetchPopularDorms = async () => {
      try {
        const { data, error } = await supabase
          .from('DormWithRatings')
          .select('*')
          .eq('availability', 'available')
          .order('avg_rating', { ascending: false })
          .order('review_count', { ascending: false })
          .limit(6);

        if (error) throw error;
        setPopularDorms(data || []);
      } catch (err) {
        console.error('Error fetching popular dorms:', err);
      }
    };

    fetchPopularDorms();
  }, []);

  const handleStart = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    router.push('/home');
  };

  return (
    <main className="min-h-screen bg-white font-sans overflow-x-hidden">
      <Hero 
        onStart={handleStart} 
        onLearnMore={() => router.push('/learn-more')}
        onInstall={handleInstall}
        isInstalled={isInstalled}
      />
      <Features />
      <HowItWorks />
      <Stats />
      <PopularChoices onStart={handleStart} dorms={popularDorms} />
      <CTA onStart={handleStart} />
      <Footer />
      {showTip && <InstallTip isIOS={isIOS} onClose={() => setShowTip(false)} />}
    </main>
  );
}
