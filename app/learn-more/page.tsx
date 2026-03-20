'use client';

import { 
  ShieldCheck, 
  Users, 
  Heart, 
  Target, 
  Search, 
  ChevronLeft, 
  ArrowRight,
  Globe,
  Zap,
  CheckCircle2,
  Sparkles,
  Navigation
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import NavigationBar from "@/app/components/NavigationBar";
import AuthBanner from "@/app/components/AuthBanner";

const LearnMoreHero = () => (
  <section className="relative min-h-[70dvh] flex flex-col items-center justify-center px-6 overflow-hidden bg-white pt-20">
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px]" 
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" 
      />
    </div>

    <div className="relative z-10 text-center max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10 w-fit mx-auto">
          <Sparkles className="w-3.5 h-3.5 text-primary fill-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Our Mission</span>
        </div>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl sm:text-7xl font-black text-neutral-dark mb-8 tracking-tighter leading-[0.9]"
      >
        Housing the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Future.</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-gray-500 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-12"
      >
        We're on a mission to redefine the student living experience in the Philippines by providing a safe, transparent, and community-first platform for everyone.
      </motion.p>
    </div>
  </section>
);

const MissionSection = () => (
  <section className="py-24 px-6 bg-gray-50/50">
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        <h2 className="text-4xl md:text-5xl font-black text-neutral-dark tracking-tighter leading-tight">
          A platform built on <br className="hidden sm:block" /> 
          <span className="text-secondary">Trust and Empathy.</span>
        </h2>
        <p className="text-gray-500 text-lg font-medium leading-relaxed">
          Tuloy PH started with a simple observation: finding a safe and decent place to stay while studying shouldn't be a nightmare. We've built a ecosystem that protects students and empowers property owners.
        </p>
        
        <div className="space-y-4">
          {[
            { icon: <Target className="w-5 h-5" />, text: "Accessibility for every Filipino student." },
            { icon: <ShieldCheck className="w-5 h-5" />, text: "100% verified properties and owners." },
            { icon: <Users className="w-5 h-5" />, text: "Fostering long-term student communities." }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-primary">{item.icon}</div>
              <span className="text-sm font-black text-neutral-dark uppercase tracking-tight">{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        className="relative"
      >
        <div className="aspect-[4/5] bg-neutral-dark rounded-[4rem] overflow-hidden relative shadow-2xl">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-10" />
           <div className="absolute inset-0 flex items-center justify-center p-12 text-center z-20">
              <div className="space-y-6">
                 <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-md border border-white/20">
                    <Heart className="w-10 h-10 text-white fill-current" />
                 </div>
                 <h3 className="text-2xl font-black text-white italic tracking-tight">"Because you deserve to feel at home, wherever you are."</h3>
              </div>
           </div>
        </div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-[60px]" />
      </motion.div>
    </div>
  </section>
);

const VerificationGrid = () => {
  const steps = [
    {
      title: "Identity Check",
      desc: "Owners must undergo a multi-step identity verification process including government ID checks.",
      icon: <Target className="w-6 h-6" />
    },
    {
      title: "Property Audit",
      desc: "Every listing is reviewed for accuracy in location, amenities, and safety standards.",
      icon: <Search className="w-6 h-6" />
    },
    {
      title: "Real Reviews",
      desc: "Only verified tenants can leave reviews, ensuring you see the honest truth about every property.",
      icon: <CheckCircle2 className="w-6 h-6" />
    }
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto text-center mb-20">
        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary mb-4 block">Safety First</span>
        <h2 className="text-4xl md:text-6xl font-black text-neutral-dark tracking-tighter">How We Keep You Safe.</h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 flex flex-col items-center text-center group hover:bg-neutral-dark transition-all duration-500"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-white/10 group-hover:text-white transition-colors">
              {step.icon}
            </div>
            <h4 className="text-2xl font-black text-neutral-dark group-hover:text-white transition-colors mb-4 tracking-tight">{step.title}</h4>
            <p className="text-gray-400 font-medium group-hover:text-gray-400 transition-colors leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const FinalCTA = ({ router }: { router: any }) => (
  <section className="py-24 px-6 mb-20">
     <motion.div 
       initial={{ opacity: 0, scale: 0.95 }}
       whileInView={{ opacity: 1, scale: 1 }}
       className="max-w-5xl mx-auto bg-neutral-dark rounded-[4rem] p-12 sm:p-24 text-center relative overflow-hidden shadow-2xl"
     >
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -mr-40 -mt-40" />
        <div className="relative z-10">
           <h2 className="text-4xl sm:text-6xl font-black text-white mb-8 tracking-tighter">Ready to join?</h2>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/auth/register')}
                className="bg-white text-neutral-dark px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-95 shadow-xl"
              >
                Join as Student
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => router.push('/auth/register?role=owner')}
                className="bg-transparent text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] border-2 border-white/10 flex items-center justify-center gap-3 hover:bg-white/5 transition-all active:scale-95"
              >
                List Property
              </button>
           </div>
        </div>
     </motion.div>
  </section>
);

export default function LearnMorePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <NavigationBar />
      
      {/* Back Button Overlay */}
      <div className="fixed top-24 left-6 z-40 hidden lg:block">
         <button 
           onClick={() => router.back()}
           className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-90 group"
         >
           <ChevronLeft className="w-5 h-5 text-neutral-dark group-hover:-translate-x-0.5 transition-transform" />
         </button>
      </div>

      <LearnMoreHero />
      <MissionSection />
      <VerificationGrid />
      
      <section className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="p-12 bg-gray-50 rounded-[3rem] flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-8">
                  <Zap className="w-7 h-7" />
               </div>
               <h3 className="text-2xl font-black text-neutral-dark mb-4 uppercase tracking-tighter">Fast Inquiries</h3>
               <p className="text-gray-400 font-medium tracking-wide">Direct messaging with property owners means no middlemen and faster booking times.</p>
            </div>
            <div className="p-12 bg-gray-50 rounded-[3rem] flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8">
                  <Globe className="w-7 h-7" />
               </div>
               <h3 className="text-2xl font-black text-neutral-dark mb-4 uppercase tracking-tighter">Nationwide Coverage</h3>
               <p className="text-gray-400 font-medium tracking-wide">Find housing near major universities across the top student hubs in the Philippines.</p>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA router={router} />

      <AuthBanner />
    </div>
  );
}
